import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/LoginService";
import { HOMEADMIN, saveUserProfil } from "../Utils/Utils";
export default function LoginForm() {
  const { register, handleSubmit, reset } = useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsSubmit(true);
   
    setTimeout(()=>{
      loginUser(data)
      .then((res) => {
        if (res.data) {
          const data = {
            ...res.data,
          };
          saveUserProfil(data);
          reset();
          navigate(`${HOMEADMIN}/stats`)
          
        }
      })
      .catch((err) => {
        setIsSubmit(false);
        if (err.code === "ERR_BAD_REQUEST") {
          toast.error("Verifier vos identifiants");
        }
      });
    },1500)

  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Username</span>
        </label>
        <input
          name="username"
          type="text"
          placeholder="username"
          className="input input-bordered w-full"
          {...register("username", {
            required: "Please enter your username.",
          })}
        />
      </div>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text text-slate-600">Password</span>
        </label>
        <input
          
          name="password"
          type="password"
          placeholder="password"
          className="input input-bordered w-full"
          {...register("password", {
            required: "Please enter your username.",
          })}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmit ? true : false}
        className={`${!isSubmit
          ? "text-white bg-blue-500"
          : "text-slate-800 bg-slate-200 "
          } mt-5  p-3 w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow hover:bg-blue-600 hover:text-white h-9 px-4 py-2`}
      >
        {isSubmit ? "Veuillez patientez... " : "Se connecter"}{" "}
            {isSubmit ? (
              <span className="loading loading-dots loading-xs"></span>
        ) : null}
      </button>
    </form>
  );
}
