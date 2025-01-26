import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PricingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Public");

  useEffect(() => {}, [activeTab]);

  return (
    <div className="py-[65px] min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-white">
      <div className="w-full max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-center">
          Choisissez votre bon forfait !!
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Choisissez parmi les meilleurs plans, garantissant une correspondance
          parfaite. Besoin de plus ou de moins ? Personnalisez votre abonnement
          pour un ajustement parfait !
        </p>
        {/* Tab */}
        <div
          role="tablist"
          className="tabs tabs-boxed flex mx-auto items-center justify-center mt-6 bg-white w-44"
        >
          <a
            role="tab"
            className={`tab ${
              activeTab === "Public"
                ? "bg-purple-600 text-white px-6  rounded-full"
                : ""
            }`}
            onClick={() => setActiveTab("Public")}
          >
            Public
          </a>
          <a
            role="tab"
            className={`tab ${
              activeTab === "Prive"
                ? "bg-purple-600 text-white px-6  rounded-full"
                : ""
            }`}
            onClick={() => setActiveTab("Prive")}
          >
            Prive
          </a>
        </div>
        {/* <div className="flex justify-center mt-6">
          <button className="bg-purple-600 text-white px-6 py-2 rounded-full">
            Monthly
          </button>
          <button className="ml-4 border border-purple-600 text-purple-600 px-6 py-2 rounded-full">
            Quarterly (save 10%)
          </button>
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12 ">
          <div className="border border-gray-200 rounded-2xl p-8 shadow-md hover:border hover:border-purple-400 duration-300 transition-all">
            <div className="p-2 bg-purple-500 w-12 h-8 rounded-md flex items-center justify-center">
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
              {/* <li>&#10003; Dedicated dashboard</li>
              <li>&#10003; Updates via Dashboard & Slack</li> */}
            </ul>
            <button className="w-full mt-6 bg-gray-800 text-white py-2 rounded-lg">
              Get started
            </button>
          </div>

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
              {/* <li>&#10003; Tasks delivered one-by-one</li>
              <li>&#10003; Dedicated dashboard</li>
              <li>&#10003; Updates via Dashboard & Slack</li> */}
            </ul>
            <button
              onClick={() => {
                navigate(`/abonnement/${id}`, {
                  state: {},
                });
              }}
              className="w-full mt-6 bg-gray-800 text-white py-2 rounded-lg"
            >
              Get started
            </button>
          </div>

          {/* <div class="border border-gray-200 rounded-2xl p-8 shadow-md bg-purple-100">
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
