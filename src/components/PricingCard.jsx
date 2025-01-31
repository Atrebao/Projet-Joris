/* eslint-disable no-unused-vars */

import { useNavigate } from "react-router-dom";

/* eslint-disable react/prop-types */
export default function PricingCard({ plan, prix }) {
  const navigate = useNavigate();

  return (
    <div className=" rounded-2xl p-8 shadow-md hover:border hover:border-purple-400 duration-300 transition-all">
      <div className="p-2 bg-purple-500 w-28 h-8 rounded-md flex items-center justify-center">
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
  );
}
