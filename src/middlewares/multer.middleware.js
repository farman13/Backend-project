import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")               // storing the files locally on the server
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)          // storing file with original file name
    }
})

export const upload = multer({
    storage
})