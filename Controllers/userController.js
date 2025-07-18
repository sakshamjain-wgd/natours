const User = require('../models/userModel');
const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sharp = require('sharp');
const factory = require('../Controllers/handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true);
    } else {
        cb(new AppError(`It's not an image. Please upload images only.`), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async(req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500,500, {
            position: 'top'
        })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    });

    return newObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data : {
            users
        }
    })
});

exports.updateMe = catchAsync(async(req, res, next) => {
    //1) Create error if user POSTs password data:
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    //2) Filter out all the unwanted fields that are not allowed to be updated.
    const filteredBody = filterObj(req.body, 'name', 'email');

    if(req.file) filteredBody.photo = req.file.filename

    //3) Update user document:
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, 
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.createUser = (req, res) => {
    const newId = users[users.length - 1].id + 1;
    const newUser = Object.assign({id: newId}, req.body);
    
    users.push(newUser);

    fs.writeFile(
        `${__dirname}/dev-data/data/users.json`,
        JSON.stringify(users),
        err => {
            res.status(201).json({
                status: 'success',
                data: {
                    user: newUser,
                }
            })
        }
    )
    // res.send('Posted.')
}

exports.getUser = (req, res) => {
    // console.log(req.params);
    const id = req.params.id * 1;
    const user = users.find(el => el.id === id);
    // if(id > users.length){
    if(!user){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
}

exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User);