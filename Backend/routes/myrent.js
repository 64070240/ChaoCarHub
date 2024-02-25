const express = require('express')
const pool = require('../config.js')
const { isLoggedIn } = require('../middlewares')

router = express.Router();

//user car
router.get("/myrent/car", isLoggedIn, async function (req, res, next) {
    console.log(req.user.id)
    try {
        const [rows, fields] = await pool.query("SELECT *, DATE_FORMAT(r_day_pickup, '%Y-%m-%d') as dayPickup, DATE_FORMAT(r_day_return, '%Y-%m-%d') as dayReturn FROM rental left outer join car using(car_id) where u_id = ?", [req.user.u_id])
        return res.json(rows)
    } catch (err) {
        return res.status(500).json(err)
      }
    
  });

  //is pay?
  router.get("/myrent/pay",isLoggedIn, async function (req, res, next) {
    try {
      const [rows, fields] = await pool.query('SELECT r_id FROM payment')
      return res.json(rows)
    } catch (err) {
      return res.status(500).json(err)
    }
  
  });

  //is return?
  router.get("/myrent/return",isLoggedIn, async function (req, res, next) {
    try {
      const [rows, fields] = await pool.query('SELECT r_id FROM return_car')
      return res.json(rows)
    } catch (err) {
      return res.status(500).json(err)
    }
  
  });

  //button pickup car
  router.put("/myrent/pickup/:id",isLoggedIn, async function (req, res, next) {
    try {
      const [rows, fields] = await pool.query('UPDATE rental SET r_status=? WHERE r_id=?', 
      ["return", req.params.id])
      return res.json(rows)
    } catch (err) {
      return res.status(500).json(err)
    }
  
  });

  //button cancel pickup car 
  router.put("/myrent/cancelPickup/:id",isLoggedIn, async function (req, res, next) {
    try {
      const [rows1, fields1] = await pool.query('UPDATE rental SET r_status=? WHERE r_id=?', 
      ["cancel", req.params.id])

      const [rows2, fields2] = await pool.query('INSERT INTO return_car(r_id, re_timestamp, re_status) VALUES(?, CURRENT_TIMESTAMP, ?)', 
      [req.params.id, "ยกเลิกการรับรถ"])

      console.log("Router for cancel is here")
      return res.json({rows1, rows2})
    } catch (err) {
      return res.status(500).json(err)
    }
  
  });

  router.post("/myrent/returnCancelPickup/:id",isLoggedIn, async function (req, res, next) {
    try {

      const [rows, fields] = await pool.query('INSERT INTO return_car(r_id, re_timestamp, re_status) VALUES(?, CURRENT_TIMESTAMP, ?)', 
      [req.params.id, "ยกเลิกการรับรถ"])

      console.log("Router for return cancel is here: ", res.json(rows))
      return res.json(rows)
    } catch (err) {
      return res.status(500).json(err)
    }
  
  });

  //button return car
  router.post("/myrent/return/:id",isLoggedIn, async function (req, res, next) {
    try {
      const [rows, fields] = await pool.query('INSERT INTO return_car(r_id, re_timestamp, re_status) VALUES(?, CURRENT_TIMESTAMP, ?)', 
      [req.params.id, "รอตรวจสอบการคืนรถ"])
      return res.json(rows)
    } catch (err) {
      return res.status(500).json(err)
    }
  });

  //get info for admin
  router.get("/admin/return",isLoggedIn, async function (req, res, next) {
    try {
      const [rows, fields] = await pool.query(`
      SELECT *,DATE_FORMAT(r_day_return, '%Y-%m-%d') as r_day_return FROM return_car 
      join rental using(r_id)
      join car using(car_id)
      join user using(u_id)
      WHERE re_status IN ("รอตรวจสอบการคืนรถ", "ยกเลิกการรับรถ")`)
      return res.json(rows)
    } catch (err) {
      return res.status(500).json(err)
    }
  
  });
  
  // admin verify cancel pickup
  router.put("/admin/returnCancelPickup/:id" ,isLoggedIn, async function (req, res, next) {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      //change return_car status
      const results1 = await conn.query(
        "UPDATE return_car SET re_status=? WHERE re_id=?",
        ["คืนรถสำเร็จ", req.params.id]
      );
  
      await conn.commit();
      return res.json("รับทราบการยกเลิกรับรถสำเร็จ");
    } catch (err) {
      await conn.rollback();
      return res.status(400).json(err);
    } finally {
      conn.release();
    }
  });


  //admin return car check
  router.put("/admin/return/:id" ,isLoggedIn, async function (req, res, next) {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      //change return_car status
      const results1 = await conn.query(
        "UPDATE return_car SET re_status=? WHERE re_id=?",
        ["คืนรถสำเร็จ", req.params.id]
      );
      const getId = await conn.query(
        "SELECT r_id FROM return_car WHERE re_id=?",
        [req.params.id]
      );
      // console.log(getId[0][0].r_id)
      //change rental status
      const results2 = await conn.query(
        "UPDATE rental SET r_status=? WHERE r_id=?",
        ["history", getId[0][0].r_id]
      );
  
      await conn.commit();
      return res.json("อัพเดตสถานะการคืนรถสำเร็จ");
    } catch (err) {
      await conn.rollback();
      return res.status(400).json(err);
    } finally {
      conn.release();
    }
  });

  router.post("/myrent/remove",isLoggedIn, async function (req, res, next) {
    const {rentId} = req.body
    // console.log(req.body)
    try {
      
      const [rows, fields] = await pool.query("DELETE FROM rental WHERE r_id = ?", [rentId])
      return res.json({message: `Delete car Id ${rentId}`});
  
    } catch (err) {
      console.log(err)
      res.json({message: "can't find rent Id"})
      return next(err);
    }
  });

exports.router = router;