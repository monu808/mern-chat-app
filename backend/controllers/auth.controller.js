import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateTokenAndSetCookie from '../utils/generateToken.js';
export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }

        const user = await User.findOne({ username});

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // HASH PASSWORD HERE
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const boyProfilePic = "https://avatar.iran.liara.run/public/boy?username=${username}";
        const girlProfilePic = "https://avatar.iran.liara.run/public/girl?username=${username}";

        const newuser = new User({
            fullName,
            username,
            password: hashedPassword,
            gender,
            ProfilePic: gender === "male" ? boyProfilePic : girlProfilePic
        });

        if (newuser) {
            // Generate JWT token
            generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            ProfilePic: newUser.ProfilePic
        });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }


    } catch (error) {
        console.log("Something went wrong: ", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = user && (await bcrypt.compare(password, user?.password || ""));

        if(!user || !isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            ProfilePic: user.ProfilePic
        });

    } catch (error) {
        console.log("Something went wrong: ", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Something went wrong: ", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};