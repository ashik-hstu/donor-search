import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware - allow CORS & base64 uploads for medical reports and NID images
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://sourav:Y0MdcKy5Qz2YouYr@cluster0.jmnuuto.mongodb.net/?appName=Cluster0";

// Global database connection caching for Serverless (Vercel) & traditional environments
let client = null;
let clientPromise = null;
let db = null;
let usersCollection = null;
let adminsCollection = null;
let requestsCollection = null;
let isMigrated = false;

// Standard 90-day cooldown calculation
const COOLDOWN_DAYS = 90;
const calculateCooldown = (lastDonatedDate) => {
  if (!lastDonatedDate) return { isAvailable: true, nextEligibleDate: null };
  const lastDate = new Date(lastDonatedDate);
  const nextDate = new Date(lastDate.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const isAvailable = now >= nextDate;
  return {
    isAvailable,
    nextEligibleDate: nextDate.toISOString(),
  };
};

async function connectDB() {
  if (db && usersCollection && adminsCollection && requestsCollection) {
    return { db, usersCollection, adminsCollection, requestsCollection };
  }

  if (!clientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
    });
    clientPromise = client.connect().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }

  await clientPromise;

  if (!db) {
    db = client.db(process.env.DB_NAME || "myDatabase");
    usersCollection = db.collection("users");
    adminsCollection = db.collection("admins");
    requestsCollection = db.collection("blood_requests");
    console.log("Connected to MongoDB successfully!");
  }

  // Ensure default admin exists and migrate records once
  if (!isMigrated) {
    isMigrated = true;
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
      const existingAdmin = await adminsCollection.findOne({ email: adminEmail });
      if (!existingAdmin) {
        await adminsCollection.insertOne({
          name: process.env.ADMIN_NAME || "Admin",
          email: adminEmail,
          password: process.env.ADMIN_PASSWORD || "123456",
          role: "admin",
          createdAt: new Date(),
        });
        console.log("Default admin created");
      }

      const count = await usersCollection.countDocuments();
      if (count > 0) {
        await usersCollection.updateMany(
          { status: { $exists: false } },
          {
            $set: {
              status: "approved",
              role: "donor",
              age: 24,
              gender: "Male",
              weight: 65,
              resubmitCount: 0,
              isAppealed: false,
              donationCount: 2,
              lastDonatedAt: null,
              isAvailable: true,
              createdAt: new Date(),
              medicalRecords: {
                smoking: false,
                drinking: false,
                bloodAllergy: false,
                hivTest: true,
                hepatitisTest: true,
                recentTattooOrSurgery: false,
                chronicDisease: false,
              },
            },
          }
        );
      }
    } catch (migErr) {
      console.error("Migration/Admin setup warning:", migErr.message);
    }
  }

  return { db, usersCollection, adminsCollection, requestsCollection };
}

// ==========================================
// 1. PUBLIC & AUTH ROUTES
// ==========================================

// GET / - Health Check
app.get("/", (req, res) => {
  res.send({
    status: "ok",
    message: "Blood Donation Platform API is live!",
    database: db ? "connected" : "ready",
  });
});

// Middleware: Ensure MongoDB is connected for all subsequent API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// GET /users - Legacy endpoint used by client router loader
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    // Compute dynamic cooldowns for each user
    const formatted = users.map((u) => {
      if (u.lastDonatedAt) {
        const cd = calculateCooldown(u.lastDonatedAt);
        u.isAvailable = cd.isAvailable;
        u.nextEligibleDate = cd.nextEligibleDate;
      }
      return u;
    });
    res.send(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

// GET /api/donors/stats - Metrics per blood group & total
app.get("/api/donors/stats", async (req, res) => {
  try {
    const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const approvedDonors = await usersCollection
      .find({ status: "approved" })
      .toArray();

    const stats = groups.map((grp) => {
      const donorsInGroup = approvedDonors.filter((d) => d.group === grp);
      const availableNow = donorsInGroup.filter((d) => {
        if (!d.lastDonatedAt) return true;
        const cd = calculateCooldown(d.lastDonatedAt);
        return cd.isAvailable;
      }).length;

      return {
        group: grp,
        total: donorsInGroup.length,
        available: availableNow,
        onCooldown: donorsInGroup.length - availableNow,
      };
    });

    const totalDonors = approvedDonors.length;
    const totalPending = await usersCollection.countDocuments({
      status: { $in: ["pending", "appealed"] },
    });
    const totalDonations = approvedDonors.reduce(
      (sum, d) => sum + (Number(d.donationCount) || 0),
      0
    );

    res.send({
      success: true,
      stats,
      totalDonors,
      totalPending,
      totalDonations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch stats" });
  }
});

// GET /api/donors - Public approved donor directory with search & filters
app.get("/api/donors", async (req, res) => {
  try {
    const { group, location, hospital, availableOnly, district, city } = req.query;

    const query = { status: "approved" };

    if (group && group !== "ALL") {
      query.group = group.toUpperCase();
    }

    if (district && district !== "ALL") {
      query.$or = [
        { district: { $regex: district, $options: "i" } },
        { location: { $regex: district, $options: "i" } },
      ];
    }

    if (city && city !== "ALL") {
      const cityFilter = [
        { city: { $regex: city, $options: "i" } },
        { location: { $regex: city, $options: "i" } },
        { hospital: { $regex: city, $options: "i" } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: cityFilter }];
        delete query.$or;
      } else {
        query.$or = cityFilter;
      }
    }

    if (location) {
      if (query.$and) {
        query.$and.push({ location: { $regex: location, $options: "i" } });
      } else {
        query.location = { $regex: location, $options: "i" };
      }
    }

    if (hospital) {
      query.hospital = { $regex: hospital, $options: "i" };
    }

    const donors = await usersCollection.find(query).toArray();

    // Map availability and cooldowns
    const formatted = donors.map((d) => {
      const cd = calculateCooldown(d.lastDonatedAt);
      return {
        ...d,
        isAvailable: cd.isAvailable,
        nextEligibleDate: cd.nextEligibleDate,
      };
    });

    const result = availableOnly === "true"
      ? formatted.filter((d) => d.isAvailable)
      : formatted;

    res.send({
      success: true,
      count: result.length,
      donors: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to query donors" });
  }
});

// GET /api/donors/:id - Single donor details
app.get("/api/donors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid ID format" });
    }
    const donor = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!donor) {
      return res.status(404).send({ error: "Donor not found" });
    }
    const cd = calculateCooldown(donor.lastDonatedAt);
    donor.isAvailable = cd.isAvailable;
    donor.nextEligibleDate = cd.nextEligibleDate;
    res.send({ success: true, donor });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch donor details" });
  }
});

// POST /api/donor/login - Donor login using Email and Password
app.post("/api/donor/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Both registered email and password are required.",
      });
    }

    const donor = await usersCollection.findOne({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (!donor) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password. Please verify your credentials.",
      });
    }

    const cd = calculateCooldown(donor.lastDonatedAt);
    donor.isAvailable = cd.isAvailable;
    donor.nextEligibleDate = cd.nextEligibleDate;

    res.send({
      success: true,
      message: "Donor login successful!",
      donor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Donor authentication failed" });
  }
});

// ==========================================
// 2. REGISTRATION & QUALIFICATION CHECK
// ==========================================

// Helper: Calculate age from DOB
const getAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

// POST /users - Donor registration
app.post("/users", async (req, res) => {
  try {
    const data = req.body;

    // 1. Qualification Check: Age 18+
    let calculatedAge = data.age ? Number(data.age) : null;
    if (data.dob) {
      const dobAge = getAge(data.dob);
      if (dobAge !== null) calculatedAge = dobAge;
    }

    if (!calculatedAge || calculatedAge < 18) {
      return res.status(400).send({
        success: false,
        message: "Qualification failed: Donor must be at least 18 years old to donate blood.",
      });
    }

    // 2. Mandatory Medical Test Report Check
    if (!data.testReportPhotos || !data.testReportPhotos.length || !data.testReportPhotos[0]) {
      return res.status(400).send({
        success: false,
        message:
          "Mandatory requirement: Please upload your Medical Test Result photo containing all required screening tests on one page.",
      });
    }

    // Check duplicate email or contact
    const existing = await usersCollection.findOne({
      $or: [
        { email: data.email?.trim().toLowerCase() },
        { contact: data.contact?.trim(), group: data.group },
      ],
    });

    if (existing) {
      return res.status(400).send({
        success: false,
        message: "A donor candidate with this email or contact already exists!",
      });
    }

    // Calculate previous donation date & cooldown
    let parsedLastDonatedAt = null;
    let initialCooldownUntil = null;
    let initialIsAvailable = false;
    const previousCount = Number(data.previousDonationCount) || (data.lastDonationDate ? 1 : 0);

    if (data.lastDonationDate) {
      const lastDate = new Date(data.lastDonationDate);
      if (!isNaN(lastDate.getTime())) {
        parsedLastDonatedAt = lastDate.toISOString();
        const cd = calculateCooldown(parsedLastDonatedAt);
        initialIsAvailable = cd.isAvailable;
        initialCooldownUntil = cd.nextEligibleDate;
      }
    }

    // Role and status assignment:
    // Any new donor candidate is put on 'pending' status for admin approval
    const newDonor = {
      name: data.name,
      email: data.email?.trim().toLowerCase(),
      contact: data.contact,
      password: data.password || "123456",
      group: data.group,
      dob: data.dob || null,
      age: calculatedAge,
      gender: data.gender || "Not specified",
      weight: Number(data.weight) || 55,
      location: data.location,
      district: data.district || "Rangpur",
      city: data.city || "Dinajpur",
      hospital: data.hospital || "Dinajpur Sadar Hospital (250 Bed)",
      photo: data.photo || null,
      nid: data.nid || "",
      nidPhoto: data.nidPhoto || null,
      role: data.role || "donor",
      status: "pending", // Put on hold for admin review
      resubmitCount: 0, // Max 3 edits during pending
      isAppealed: false,
      rejectionReason: null,
      donationCount: previousCount,
      lastDonatedAt: parsedLastDonatedAt,
      cooldownUntil: initialCooldownUntil,
      isAvailable: false, // Not available in public search until admin approves
      medicalRecords: {
        smoking: Boolean(data.smoking),
        drinking: Boolean(data.drinking),
        bloodAllergy: Boolean(data.bloodAllergy),
        allergyDetails: data.allergyDetails || "",
        hivTest: Boolean(data.hivTest),
        hepatitisTest: Boolean(data.hepatitisTest),
        recentTattooOrSurgery: Boolean(data.recentTattooOrSurgery),
        chronicDisease: Boolean(data.chronicDisease),
        diseaseDetails: data.diseaseDetails || "",
        testReportPhotos: data.testReportPhotos || [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newDonor);

    res.send({
      success: true,
      message:
        "Registration submitted successfully! Your application is currently on hold (Pending Review). Our medical admin team will inspect your documents for approval.",
      insertedId: result.insertedId,
      donor: { ...newDonor, _id: result.insertedId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Registration failed" });
  }
});

// ==========================================
// 3. DONOR PORTAL: RESUBMISSION & APPEAL
// ==========================================

// PUT /api/donor/:id/resubmit - Edit info (Max 3 times during pending; unlimited when approved)
app.put("/api/donor/:id/resubmit", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    const donor = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!donor) {
      return res.status(404).send({ success: false, message: "Donor not found" });
    }

    // Check resubmit limits during pending
    if (donor.status === "pending") {
      const currentCount = donor.resubmitCount || 0;
      if (currentCount >= 3) {
        return res.status(400).send({
          success: false,
          message:
            "Resubmission limit reached! You can only resubmit your documents up to 3 times while on review pending period.",
        });
      }
      updates.resubmitCount = currentCount + 1;
    }

    // Age validation if dob or age is being updated
    if (updates.dob || updates.age) {
      let calculatedAge = updates.age ? Number(updates.age) : null;
      if (updates.dob) {
        const dobAge = getAge(updates.dob);
        if (dobAge !== null) calculatedAge = dobAge;
      }
      if (calculatedAge && calculatedAge < 18) {
        return res.status(400).send({
          success: false,
          message: "Qualification failed: Donor must be at least 18 years old.",
        });
      }
      updates.age = calculatedAge;
    }

    // If last donation date is updated
    if (updates.lastDonationDate) {
      const lDate = new Date(updates.lastDonationDate);
      if (!isNaN(lDate.getTime())) {
        updates.lastDonatedAt = lDate.toISOString();
        const cd = calculateCooldown(updates.lastDonatedAt);
        updates.cooldownUntil = cd.nextEligibleDate;
        if (donor.status === "approved") {
          updates.isAvailable = cd.isAvailable;
        }
      }
    }

    updates.updatedAt = new Date();

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    const updatedDonor = await usersCollection.findOne({
      _id: new ObjectId(id),
    });

    const cd = calculateCooldown(updatedDonor.lastDonatedAt);
    updatedDonor.isAvailable = updatedDonor.status === "approved" ? cd.isAvailable : false;
    updatedDonor.nextEligibleDate = cd.nextEligibleDate;

    res.send({
      success: true,
      message:
        donor.status === "pending"
          ? `Application updated successfully! Resubmission ${updatedDonor.resubmitCount} of 3 used.`
          : "Profile details updated successfully!",
      donor: updatedDonor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Update failed" });
  }
});

// PUT /api/donor/:id/appeal - Candidate appeals rejection
app.put("/api/donor/:id/appeal", async (req, res) => {
  try {
    const { id } = req.params;
    const { appealMessage, correctedReports, updatedNidPhoto } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    const donor = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!donor) {
      return res.status(404).send({ success: false, message: "Donor not found" });
    }

    if (donor.status !== "rejected") {
      return res.status(400).send({
        success: false,
        message: "Only rejected applications can submit an appeal.",
      });
    }

    const updateDoc = {
      status: "appealed",
      isAppealed: true,
      appealDate: new Date(),
      appealMessage: appealMessage || "Candidate submitted an appeal with updated clarification.",
      updatedAt: new Date(),
    };

    if (correctedReports && correctedReports.length > 0) {
      updateDoc["medicalRecords.testReportPhotos"] = correctedReports;
    }
    if (updatedNidPhoto) {
      updateDoc.nidPhoto = updatedNidPhoto;
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    const updated = await usersCollection.findOne({ _id: new ObjectId(id) });

    res.send({
      success: true,
      message:
        "Appeal submitted successfully! Admin will re-evaluate your application with priority.",
      donor: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Appeal submission failed" });
  }
});

// ==========================================
// 4. DONATION COOLDOWN & COUNTDOWN SYSTEM
// ==========================================

// POST /api/donor/:id/donated - Donor or Admin marks blood donation
app.post("/api/donor/:id/donated", async (req, res) => {
  try {
    const { id } = req.params;
    const { donationDate, hospital, notes } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    const donor = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!donor) {
      return res.status(404).send({ success: false, message: "Donor not found" });
    }

    if (donor.status !== "approved") {
      return res.status(400).send({
        success: false,
        message: "Only verified approved donors can record blood donations.",
      });
    }

    const donationTime = donationDate ? new Date(donationDate) : new Date();
    const nextEligibleTime = new Date(
      donationTime.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    );

    const donationRecord = {
      date: donationTime,
      hospital: hospital || donor.hospital || "General Hospital",
      notes: notes || "Voluntary Blood Donation",
    };

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { donationCount: 1 },
        $set: {
          lastDonatedAt: donationTime.toISOString(),
          cooldownUntil: nextEligibleTime.toISOString(),
          isAvailable: false,
          updatedAt: new Date(),
        },
        $push: {
          donationHistory: donationRecord,
        },
      }
    );

    const updated = await usersCollection.findOne({ _id: new ObjectId(id) });

    res.send({
      success: true,
      message:
        "Blood donation recorded! Thank you for saving a life. A 3-month cooldown timer has begun.",
      donor: updated,
      cooldownUntil: nextEligibleTime.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Failed to record donation" });
  }
});

// POST /api/donor/:id/reset-cooldown - Admin overrides cooldown
app.post("/api/donor/:id/reset-cooldown", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isAvailable: true,
          lastDonatedAt: null,
          cooldownUntil: null,
          updatedAt: new Date(),
        },
      }
    );

    res.send({ success: true, message: "Cooldown reset. Donor is now marked Available." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Cooldown reset failed" });
  }
});

// ==========================================
// 5. ADMIN CONTROL & MANAGEMENT
// ==========================================

// POST /api/admin/login and /admin/login - Admin Login
app.post(["/api/admin/login", "/admin/login"], async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminsCollection.findOne({
      email: email?.trim(),
      password: password?.trim(),
    });

    if (!admin) {
      return res.status(401).send({
        success: false,
        message: "Invalid admin email or password!",
      });
    }

    res.send({
      success: true,
      message: "Admin login successful!",
      admin: {
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Login failed" });
  }
});

// PUT /api/admin/profile - Admin changes their own email or password
app.put("/api/admin/profile", async (req, res) => {
  try {
    const { currentEmail, newEmail, currentPassword, newPassword, newName } = req.body;

    const admin = await adminsCollection.findOne({
      email: currentEmail?.trim(),
      password: currentPassword?.trim(),
    });

    if (!admin) {
      return res.status(401).send({
        success: false,
        message: "Verification failed: Current admin email or password is incorrect!",
      });
    }

    const updates = {};
    if (newEmail?.trim()) updates.email = newEmail.trim();
    if (newPassword?.trim()) updates.password = newPassword.trim();
    if (newName?.trim()) updates.name = newName.trim();
    updates.updatedAt = new Date();

    await adminsCollection.updateOne({ _id: admin._id }, { $set: updates });

    res.send({
      success: true,
      message: "Admin credentials updated successfully! Use new credentials for next login.",
      admin: {
        name: updates.name || admin.name,
        email: updates.email || admin.email,
        role: "admin",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Failed to update admin profile" });
  }
});

// GET /api/admin/candidates - Pending & Appealed review list
app.get("/api/admin/candidates", async (req, res) => {
  try {
    const candidates = await usersCollection
      .find({
        status: { $in: ["pending", "appealed"] },
      })
      .sort({ updatedAt: -1 })
      .toArray();

    res.send({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch candidates" });
  }
});

// GET /api/admin/approved - Approved donor members
app.get("/api/admin/approved", async (req, res) => {
  try {
    const members = await usersCollection
      .find({ status: "approved" })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = members.map((m) => {
      const cd = calculateCooldown(m.lastDonatedAt);
      return {
        ...m,
        isAvailable: cd.isAvailable,
        nextEligibleDate: cd.nextEligibleDate,
      };
    });

    res.send({
      success: true,
      count: formatted.length,
      members: formatted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch approved members" });
  }
});

// POST /api/admin/approve/:id - Admin approves candidate (calculates previous donation cooldown)
app.post("/api/admin/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    const candidate = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!candidate) {
      return res.status(404).send({ success: false, message: "Candidate not found" });
    }

    // Check if candidate donated previously
    let isAvailable = true;
    let nextEligibleDate = null;

    if (candidate.lastDonatedAt) {
      const cd = calculateCooldown(candidate.lastDonatedAt);
      isAvailable = cd.isAvailable;
      nextEligibleDate = cd.nextEligibleDate;
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "approved",
          isAvailable: isAvailable,
          cooldownUntil: nextEligibleDate,
          rejectionReason: null,
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    res.send({
      success: true,
      message: isAvailable
        ? "Candidate approved! Donor has passed the 90-day cooldown and is marked Ready to Donate."
        : "Candidate approved! Donor's previous donation was under 90 days ago; remaining cooldown timer has been activated.",
      isAvailable,
      nextEligibleDate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Approval failed" });
  }
});

// POST /api/admin/reject/:id - Admin rejects candidate with reason
app.post("/api/admin/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "rejected",
          isAvailable: false,
          rejectionReason: reason || "Failed to meet medical / qualification criteria.",
          rejectedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    res.send({
      success: true,
      message: "Candidate application rejected.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Rejection failed" });
  }
});

// PUT /api/admin/donor/:id - Admin edits any donor info
app.put("/api/admin/donor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    const updated = await usersCollection.findOne({ _id: new ObjectId(id) });
    res.send({ success: true, message: "Donor updated successfully", donor: updated });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Admin update failed" });
  }
});

// DELETE /users/:id - Delete user or donor
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    res.send({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Failed to delete user" });
  }
});

// ==========================================
// 6. EMERGENCY BLOOD REQUESTS (With Auto-Delete & Countdown)
// ==========================================

// GET /api/requests - List emergency requests (Auto-purges expired requests)
app.get("/api/requests", async (req, res) => {
  try {
    const now = new Date();
    // Auto-delete requests where expiresAt < now so messages never pile up!
    await requestsCollection.deleteMany({
      expiresAt: { $exists: true, $ne: null, $lt: now },
    });

    const requests = await requestsCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    res.send({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch blood requests" });
  }
});

// POST /api/requests - Create an urgent blood request with duration/expiry
app.post("/api/requests", async (req, res) => {
  try {
    const data = req.body;
    // Hours valid (e.g. 12 hours)
    const hoursValid = Number(data.hoursValid) || 12;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + hoursValid * 60 * 60 * 1000);

    const newReq = {
      patientName: data.patientName,
      bloodGroup: data.bloodGroup,
      district: data.district || "Rangpur",
      city: data.city || "Dinajpur",
      hospital: data.hospital,
      location: data.location,
      contact: data.contact,
      unitsNeeded: Number(data.unitsNeeded) || 1,
      urgency: data.urgency || `Within ${hoursValid} Hours`,
      hoursValid: hoursValid,
      notes: data.notes || "",
      status: "open",
      createdAt: createdAt,
      expiresAt: expiresAt,
    };

    const result = await requestsCollection.insertOne(newReq);
    res.send({
      success: true,
      message: `Urgent blood request posted! Will automatically expire and self-delete after ${hoursValid} hours.`,
      requestId: result.insertedId,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Failed to post blood request" });
  }
});

// DELETE /api/requests/:id - Delete emergency request manually
app.delete("/api/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }
    await requestsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send({ success: true, message: "Emergency request deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Failed to delete request" });
  }
});

// START SERVER (only listen when running directly, not in Vercel serverless environment)
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`Blood Donation API Server running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB on startup:", err);
      app.listen(port, () => {
        console.log(`Blood Donation API Server running on port ${port} (DB disconnected)`);
      });
    });
}

export default app;
