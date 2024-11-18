/* eslint-disable jsx-a11y/alt-text */
'use client';
import React from "react";
import CustomButton from "@/components/ui/CustomButton";
import Input from "@/components/ui/Input";
import Image from "next/legacy/image";
import { RefreshIcon } from "@/lib/svg/icons";
import { useRouter } from 'next/navigation';

function CardComponent() {
  const router = useRouter();

  return (
    <div className="card-component-backdrop w-full h-screen flex justify-center items-center relative">
      <Image
        style={{zIndex: -1}}
        src="/bg.svg"
        alt="Time Management"
        objectFit="cover"
        layout="fill"
      />
      <div className="card-component-container bg-foreground w-[25em] p-5 flex justify-center rounded-3xl z-10 shadow-popup">
        <div className="card-component-content text-center w-full p-2.5">
            <h1 className="text-xl font-bold text-text-primary capitalize">Login</h1>
            <h4 className="text-sm font-semibold text-text-secondary pb-5">Welcome Back! Please Login to access.</h4>
            <div>
              <Input inputType={'text'} inputLabel={'Username'} placeholderText={'Enter your username'} inputAttr={true} className={''} labelClassName={''} inputClassName={''}/>
              <Input inputType={'password'} inputLabel={'Password'} placeholderText={'Enter your password'} inputAttr={true} className={''} labelClassName={''} inputClassName={''}/>
              <div className="py-2 flex flex-col text-left">
                <label className="font-bold font-base pb-1 text-text-primary">Captcha<span className="text-danger ml-1">*</span></label>
                <div className="flex justify-between items-center pb-2">
                  <div className="flex gap-3 items-center">
                    <input type="text" className="h-10 w-10 rounded-lg border bg-transparent text-text-primary border-border-grey font-sm font-normal px-3 text-center" disabled value="8" />
                    <span className="font-sm font-normal text-text-primary">+</span>
                    <input type="text" className="h-10 w-10 rounded-lg border bg-transparent text-text-primary border-border-grey font-sm font-normal px-3 text-center" disabled value="3" />
                  </div>
                  <span className="text-primary">{RefreshIcon()}</span>
                </div>
                <input className="h-10 rounded-full border bg-transparent text-text-primary border-border-grey text-sm font-normal px-3 focus:outline-none focus:border-primary placeholder-text-secondary focus:ring-0" type="text" placeholder="Enter captcha" required/>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <label className="flex items-center text-sm text-text-primary font-semibold"><input type="checkbox" name="remember" className="mr-1"/>Remember Me</label>
              <a href="/forgot-password" className="text-sm text-primary font-bold">Forgot Password?</a>
            </div>
            <div className="flex mt-10 justify-center text-base font-medium">
              <CustomButton 
                variant="primary" 
                borderRadius="full" 
                width = "200px" 
                height="40px"
                onClick={() => router.push('/dashboard')}
                btnText='Login'
              />
            </div>
        </div>
      </div>
    </div>
  );
}

export default CardComponent;

