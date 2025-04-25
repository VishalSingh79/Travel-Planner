import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { auth, db } from "../../firebase-config";
import {setDoc, doc } from "firebase/firestore"; 
import "./Register.css"; 

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Password does not match");
    }

    try {
      setLoading(true);
      await signup(email, password);
      const user = auth.currentUser;
      console.log(user);
      console.log("User Created Successfully");
      if(user){
        await setDoc(doc(db,"Users", user.uid),{
          email:user.email,
          name:displayName,
        });
      } 
      toast.success("Your account has been created successfully!!");

      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h1>Create an Account</h1>
          <p>Sign up to start planning your trips</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-name">
            <label htmlFor="displayName" >Name:</label>
            <br/>
            <input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="register-name">
            <label htmlFor="email">Email:</label>
            <br/>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="register-name">
            <label htmlFor="password">Password:</label>
            <br/>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="register-name">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <br/>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
