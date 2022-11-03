const express = require('express'),
      router = express.Router();
      const Article = require('../model/Article');
      const Contact = require('../model/Contact')


router.get('/',(req,res)=>{

    Article.find((err,record)=>{
        if (err) console.log(err);
        else {
            res.render('index',{record:record});
        }
    }).sort({ date: 'desc' });
});


router.get("/indexDetails/:slug", (req, res) => {
        Article.find({slug:req.params.slug}, (err, record) => {
            if (record) {
                res.render('indexDetails', {record});
            } else{
                console.log(err)
            }
        })
    });

    //View Sports by Category
    router.get('/sports/:category', (req,res)=>{

            Article.find({category:req.params.category}, (err, record) => {
                if (record) {
                    res.render('sportCat', {record})
                }
            }).sort({ date: 'desc' })

    });

    //View Details of Sports
    router.get("/details/:slug", (req, res) => {
            Article.find({slug:req.params.slug}, (err, record) => {
                if (record) {
                    res.render('sportCatDetails', {record});
                } else{
                    console.log(err)
                }
            }).sort({ date: 'desc' })
        })

//Contact Handle
router.get('/contactUs', (req, res) => {
    res.render('contact');
})

router.post('/contactUs', (req, res)=>{
    const{mail, message} = req.body;

    let errors = [];

    if(errors.length > 0){
        res.render('contact', {
            errors,
            mail, message
        });

    }else{
        //validation passed
            const newContact = new Contact({ mail, message });
            //Save new user
            newContact.save()
            .then(user => {
            req.flash('success_msg', 'Message sent successfully')
            res.redirect('/contactUs');
            })
            .catch(err => console.log(err))
                    }
    });

module.exports = router;
