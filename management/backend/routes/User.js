const { User, Appointment, Doctor } = require("../model/Model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const app = require("express").Router();
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const uuid = require("uuid");
const auth = require("../middle ware/auth");

const client = require("../tawilio");

app.post("/signup", async (req, res) => {
  let email = req.body.email;
  let id = uuid.v4();
  let password = req.body.password;
  let fName = req.body.fName;
  let age = req.body.age;
  let gender = req.body.gender;
  let accountType = req.body.accountType;
  let mNumber = req.body.mNumber;
  //real code starts
  try {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    let user = await User.findOne({ where: { email: email } });
    if (user) {
      return res.status(410).json({ status: false, code: 101 });
    } else {
      user = await User.create({
        id: id,
        email: email,
        password: password,
        fName: fName,
        age: parseInt(age),
        gender: gender,
        accountType: accountType,
        mNumber: mNumber,
      });
      return res
        .status(200)
        .json({ status: true, message: "user created successfully", code: 1 });
    }
  } catch (err) {
    console.log("Error in Signup module occured", err);
    res.status(200).json({ status: false });
  }
});

app.post("/login", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user = await User.findOne({ where: { email: email } });

  if (!user) {
    return res
      .status(410)
      .json({ status: false, error: "User dont exists ", code: 110 });
  } else {
    await bcrypt.compare(password, user.password).then((result) => {
      if (result === true) {
        dotenv.config();

        const payLoadData = {
          id: user.id,
        };
        dotenv.config();
        const token = jwt.sign(payLoadData, process.env.KEY);

        return res
          .status(200)
          .json({ status: true, token: token, code: 2, id: user.id });
      } else {
        return res
          .status(410)
          .json({ status: false, error: "Wrong password", code: 102 });
      }
    });
  }
});

app.post("/make-appointment", auth, (req, res) => {
  const userId = req.body.userId;
 
  if(req.userId !== userId) return  res.status(200).json({ sucess : false, error : "user Verification failed" });

  let id = uuid.v4();

  const doctorId = req.body.doctorId;
  const date = req.body.date;
  const time = req.body.time;



  let appointment = Appointment.create({
    id: id,
    patientId: userId,
    doctorId: doctorId,
    date: date,
    visitTime: time,
    status: "Waiting",
    seenU: "N",
    seenD: "N",
  })
    .then((data) => {
      Doctor.findOne({
        where: {
          id: doctorId,
        },
      })
        .then((data) => {
          client.messages
            .create({
              body: `Best wishes doctor, you have an appointment request for ${date} ( ${time} ) . Approve it or delete it `,
              to: `+91${data.mNumber}`, // Text this number
              from: "+15075797269", // From a valid Twilio number
            })
            .then((message) => console.log(message.sid));

          console.log({ toDoc: data.mNumber });
        })
        .catch((err) => {
          console.log({ err }); 
        });
      User.findOne({
        where: {
          id: userId,
        },
      })
        .then((data) => {
          client.messages
            .create({
              body: `Best wishes , you have booked an appointment request for ${date} ( ${time} ) . we will let you know once doc approves it or delete it `,
              to: `+91${data.mNumber}`, // Text this number
              from: "+15075797269", // From a valid Twilio number
            })
            .then((message) => console.log(message.sid));
          console.log({ toUser: data.mNumber });
        })
        .catch((err) => {
          console.log({ err });
        });

      ///

      res.status(200).json({ data, success: true });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.post("/check-avail",(req, res) => {
  const docId = req.headers.doctor;
  const date = req.body.date;
  const time = req.body.time;
  Appointment.findAll({
    where: {
      [Op.and]: [
        { doctorId: docId },
        { date: date },
        { visitTime: time },
        { status: "Approved" },
      ],
    },
  })
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.get("/doctors-types",auth,(req, res) => {


  Doctor.findAll({ attributes: ["type"], distint: "type" })
    .then((data) => {
      const data2 = data.map((e) => {
        return e.type;
      });
      const data1 = Array.from(new Set(data2));
      console.log(data1);

      res.status(200).json({ data1 });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.get("/get-doc-from-type",auth ,(req, res) => {
if(req.headers.user !== req.userId) return res.status(401).json({succes : false})

  Doctor.findAll({
    where: {
      type: req.headers.type,
    },
  })
    .then((data) => {
      console.log(data);
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.get("/get-appointments",auth,(req, res) => {
  console.log(req.headers.user)
  // console.log(req.userId)

  Appointment.findAll({ where: { patientId: req.headers.user } })
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.post("/cancel-appointment", auth,(req, res) => {
if(req.headers.user !== req.userId) return res.status(401).json({succes : false})

  let doctorId = req.body.doctorId;
  let userId = req.body.userId;
  let date = req.body.date;
  let time = req.body.time;
  Appointment.update(
    { status: "Canceled", remarks: "Canceled by user" },
    { where: { id: req.body.id, patientId: req.body.userId } }
  )
    .then((data) => {
      //

      Doctor.findOne({
        where: {
          id: doctorId,
        },
      })
        .then((data) => {
          client.messages
            .create({
              body: `Best wishes doctor, appointment request for ${date} ( ${time} ) has been canceled `,
              to: `+91${data.mNumber}`, // Text this number
              from: "+15075797269", // From a valid Twilio number
            })
            .then((message) => console.log(message.sid));

          console.log({ toDoc: data.mNumber });
        })
        .catch((err) => {
          console.log({ err });
        });
      //only doc will get message when user cancelled the appointment

      // User.findOne({
      //   where: {
      //     id: userId,
      //   },
      // })
      //   .then((data) => {
      //     client.messages
      //       .create({
      //         body: `Best wishes , you have canceled an appointment request for ${date} ( ${time} ) `,
      //         to: `+91${data.mNumber}`, // Text this number
      //         from: "+15075797269", // From a valid Twilio number
      //       })
      //       .then((message) => console.log(message.sid));
      //     console.log({ toUser: data.mNumber });
      //   })
      //   .catch((err) => {
      //     console.log({ err });
      //   });

      //
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.get("/get-notification", (req, res) => {
  Appointment.findAll({
    where: {
      [Op.and]: [{ patientId: req.headers.user }, { seenU: "N" }],
    },
  })
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});
app.patch("/set-notification", (req, res) => {
  Appointment.update(
    { seenU: "Y" },
    {
      where: {
        [Op.and]: [{ patientId: req.headers.user }, { seenU: "N" }],
      },
    }
  )
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.get("/get-get", (req, res) => {
  const date = new Date();

  Appointment.findAll({
    where: {
      [Op.and]: [
        {
          date: `${date.getFullYear()}-${
            (date.getMonth() + 1).toString().length == 1
              ? "0" + (date.getMonth() + 1).toString()
              : (date.getMonth() + 1).toString()
          }-${date.getDate()}`,
        },
        {
          visitTime: { [Op.like]: `${(date.getHours() - 2).toString()}%` },
        },
        {
          status: "Approved",
        },
      ],
    },
  })
    .then((data) => {
      data.forEach((e) => {
        User.findOne()
          .then((data1) => {
            console.log(data1.mNumber);

            // client.messages
            // .create({
            //   body: `Best wishes , you have an appointment Today on ${data.date} ( ${data.visitTime} ) `,
            //   to: `+91${data1.mNumber}`, // Text this number
            //   from: "+15075797269", // From a valid Twilio number
            // })
            // .then((message) => console.log(message.sid));
          })
          .catch((err) => {
            console.log(err);
          });
      });

      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

module.exports = app;
