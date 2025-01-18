import { useState } from "react";
import { TabProps } from "../../helpers/interface/interfaces";
import ReviewPending from "./ReviewPending";
import ReviewSubmitted from "./ReviewSubmitted";

const Reviews = () => {
  const [activeTab, setActiveTab] = useState<string>("pending reviews");
  const tabs: TabProps[] = [
    { title: "Pending reviews", content: <ReviewPending /> },
    { title: "Submitted reviews", content: <ReviewSubmitted/> },
  ];
  return (
    <div className="border">
      <div className="p-3 font-bold bg-gray-primary-400">Reviews</div>
      <div className="">
        <ul className="flex gap-12 border-b border-gray-primary-400 bg-base-gray-200">
          {tabs.map((tab) => (
            <li
              key={tab.title}
              className={`flex text-center py-2 px-3 cursor-pointer ${
                activeTab === tab.title.toLowerCase()
                  ? "border-b-primary-500 border-b-2  text-primary-500 font-bold"
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab(tab.title.toLowerCase())}
            >
              {tab.title}
            </li>
          ))}
        </ul>
        <div className="">
          {tabs.find((tab) => tab.title.toLowerCase() === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
