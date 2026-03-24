/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React from "react";
import FormsClient from "../components/FormsClient";

export default function Register() {
  return (
    // <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100  grid grid-cols-1 md:grid-cols-2  gap-12 ">
    //   <div className="hidden h-screen flex-col md:flex bg-green-400">
    //     <img
    //       className="h-screen object-cover"
    //       src="https://cdn.lesnumeriques.com/optim/news/21/217269/1206e136-netflix-prime-video-canal-disney-quelle-est-la-meilleure-plateforme-de-streaming-en-janvier-2024__1200_900__0-0-1915-1079.jpg "
    //       alt=""
    //     />
    //   </div>

    //   <div className="flex flex-col items-center justify-center ">
    //     <FormsClient />
    //   </div>
    // </div>

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-white">
      <div className="w-full max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-center">
          Choose your right plan!
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Select from best plans, ensuring a perfect match. Need more or less?
          Customize your subscription for a seamless fit!
        </p>
        {/* <div class="flex justify-center mt-6">
          <button class="bg-slate-600 text-white px-6 py-2 rounded-full">
            Monthly
          </button>
          <button class="ml-4 border border-slate-600 text-slate-600 px-6 py-2 rounded-full">
            Quarterly (save 10%)
          </button>
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 ">
          <div className="border border-gray-200 rounded-2xl p-8 shadow-md hover:border hover:border-slate-400 duration-300 transition-all">
            <div className="p-2 bg-slate-500 w-12 h-8 rounded-md flex items-center justify-center">
              <h2 className="text-white">Pro</h2>
            </div>
            <p className="text-gray-500 mt-2">
              Ideal for those who ve already got their website up and running.
            </p>
            <p className="text-4xl font-bold mt-4">
              $2500
              {/* <span className="text-lg text-gray-500">/month</span> */}
            </p>
            <ul className="mt-6 space-y-2 text-gray-600">
              <li>&#10003; 3-5 day turnaround</li>
              <li>&#10003; Native Development</li>
              <li>&#10003; Task delivered one-by-one</li>
              <li>&#10003; Dedicated dashboard</li>
              <li>&#10003; Updates via Dashboard & Slack</li>
            </ul>
            <button className="w-full mt-6 bg-gray-800 text-white py-2 rounded-lg">
              Get started
            </button>
          </div>

          <div className=" rounded-2xl p-8 shadow-md hover:border hover:border-slate-400 duration-300 transition-all">
            <div className="p-2 bg-slate-500 w-28 h-8 rounded-md flex items-center justify-center">
              <h2 className="text-white ">Pro Plus</h2>
            </div>
            <p className="text-gray-500 mt-2">
              Ideal if you want to build or scale your website fast.
            </p>
            <p className="text-4xl font-bold mt-4">
              $3800
              {/* <span className="text-lg text-gray-500">/month</span> */}
            </p>
            <ul className="mt-6 space-y-2 text-gray-600">
              <li>&#10003; 1-3 day turnaround</li>
              <li>&#10003; Monthly strategy call</li>
              <li>&#10003; Commercial license</li>
              <li>&#10003; Native Development</li>
              <li>&#10003; Tasks delivered one-by-one</li>
              <li>&#10003; Dedicated dashboard</li>
              <li>&#10003; Updates via Dashboard & Slack</li>
            </ul>
            <button className="w-full mt-6 bg-gray-800 text-white py-2 rounded-lg">
              Get started
            </button>
          </div>

          {/* <div class="border border-gray-200 rounded-2xl p-8 shadow-md bg-slate-100">
            <h2 class="text-gray-800 font-semibold">Custom</h2>
            <p class="text-gray-500 mt-2">
              If these plans don't fit, let's create one that suits.
            </p>
            <h3 class="text-2xl font-bold mt-4">Let's Talk!</h3>
            <ul class="mt-6 space-y-2 text-gray-600">
              <li>&#10003; Everything in design & development</li>
              <li>&#10003; Strategy workshop</li>
              <li>&#10003; Priority support</li>
              <li>&#10003; Multiple tasks at once</li>
              <li>&#10003; Ongoing autonomous A/B testing</li>
              <li>&#10003; Advanced custom development</li>
            </ul>
            <button class="w-full mt-6 bg-gray-900 text-white py-2 rounded-lg">
              Book a Call
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
