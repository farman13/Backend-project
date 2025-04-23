import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")               // storin gthe files locally on the server
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)          // storing with file original name
    }
})

export const upload = multer({
    storage
})