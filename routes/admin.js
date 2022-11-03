const express = require('express'),
router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
let fs = require('fs');
let path = require('path');
let multer = require('multer');

const Admin = require('../model/Admin');
const Article = require('../model/Article');
const Contact = require('../model/Contact')



 // MULTER
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, __dirname + '/uploads/')
    },
    filename: function(req, file, cb) {
      cb(null, file.fieldname +'-'+ Date.now());
    }
  })

const upload = multer({storage:storage});


//Signup Handle
router.get('/signup', (req, res) => {
    res.render('signup');
})


router.post('/signup', upload.single('image'), (req, res)=>{
    const{name, email, username, password,password2} = req.body;

    let errors = [];

    //Check passwords match

    if(password !== password2){
        errors.push({msg: "Passwords do not match"});
        req.flash('error_msg', 'Passwords do not match')
    }

    if(errors.length > 0){
        res.render('signup', {
            errors,
            name,email, username, password,password2
        });

    }else{
        //validation passed
            Admin.findOne({ username: username  })
            .then(admin => {
                if(admin){
                    //user exists
                    errors.push({msg: 'Username is already registered'});
                    res.render('signup', {
                        errors,
                        name,email, username, password,password2
                    });

                }
                else{
                    const newAdmin = new Admin({
                        name, email, username, password,  upload:{
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
            contentType: 'image/png'
          }
        });
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                            if(err) throw err;

                            //Set password hashed
                            newAdmin.password = hash;

                            //Save new user
                            newAdmin.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now successfully registered and can log in')
                                res.redirect('/admin/login');
                            })
                            .catch(err => console.log(err))
                    }))

                }
            });
    }
});


//Login Handle

router.get('/login', (req, res) => {

    res.render('login');

})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect:'/admin/dashboard',
        failureRedirect:'/admin/login',
        failureFlash:true
    })(req, res, next);
});


//Dashboard
router.get('/dashboard', ensureAuthenticated, (req,res)=>{

        Admin.find({username:req.user.username}, function(err, record){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                console.log(req.user.username)
                res.render('dashboard', {record,username:req.user.username})
            }
        })

})

//Article Handle
router.get('/article', ensureAuthenticated, (req,res)=>{

        Article.find({username:req.user.username}, function(err){
            if(err){
                console.log(err);
                res.send('There is an issue')
            }
            else{
                // console.log(req.user.username)
                res.render('article', {username:req.user.username})
            }
        })
});

router.post('/article', upload.single('image'), (req, res)=>{
    const{title, subtitle, category, articles} = req.body;

    let errors = [];

    if(errors.length > 0){
        res.render('article', {
            errors,
            title, subtitle, category, articles
        });

    }else{
        //validation passed
            const newArticle = new Article({
                        title, subtitle, category, articles, username:req.user.username,  upload:{
            data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
            contentType: 'image/png'
          }
        });

            //Save new user
            newArticle.save()
            .then(user => {
            req.flash('success_msg', 'Article added successfully')
            res.redirect('/admin/article');
            })
            .catch(err => console.log(err))
                    }

    });

//View Article
    router.get('/sports/:category', ensureAuthenticated, (req,res)=>{

            Article.find({category:req.params.category}, (err, record) => {
                if (record) {
                    res.render('viewArticle', {record})
                }
            }).sort({ date: 'desc' })

    });

//View Article More Details
    router.get("/details/:slug", ensureAuthenticated, (req, res) => {
            Article.find({slug:req.params.slug}, (err, record) => {
                if (record) {
                    res.render('viewArticleDetails', {record});
                } else{
                    console.log(err)
                }
            }).sort({ date: 'desc' })
        })

// Messages Handle
router.get('/messages', ensureAuthenticated, (req, res)=>{

    Contact.find((err,record)=>{
        if (err) console.log(err);
        else {
            res.render('messages',{record:record});
        }
}).sort({ date: 'desc' })
})

//Edit Article Handle
router.get('/editLat/:pid', ensureAuthenticated, (req, res) => {
    Article.find({_id:req.params.pid}, (error, record) => {
                if (error) {
                    req.flash('error_msg', "Could not query database")
                    res.redirect('/editLat/:pid');
                } else {
                    req.flash('success_msg', "Article successfully updated");
                    res.render('edit', {record, username:req.user.username});
                }
            })
});

router.post('/editLat/:pid', ensureAuthenticated, (req, res) => {
        const {title, subtitle, articles} = req.body;

        Article.updateOne({_id:req.params.pid}, {$set:{title, subtitle, articles}}, (error, record) => {
            if (error) {
                req.flash('error_msg', "Could not update Article");
                res.redirect('/editLat/:pid');
            } else {
                req.flash('message', "Article successfully updated");
                res.redirect('/admin/dashboard');
            }
        })
    });

//DELETE ARTICLE HANDLE
    router.get('/:id', (req, res) => {

             Article.deleteOne({_id:req.params.id}, (error, record) => {
                if (error) {
                    req.flash('error_msg', "Could not query database")
                } else {
                    req.flash('success_msg', 'Article deleted successfully')
                    res.redirect('/admin/dashboard')
                }
            })
    })




module.exports=router;
