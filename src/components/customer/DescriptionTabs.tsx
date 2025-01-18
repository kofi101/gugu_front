import React, { useState } from 'react';

interface TabProps {
  title: string;
  count?: number; // Optional for the reviews count
  content: JSX.Element;
}

const DescriptionTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('description');

  const tabs: TabProps[] = [
    {
      title: 'Description',
      content: (
        <div>
          <h2 className="text-lg font-semibold">Product Description</h2>
          <p className="mt-2 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.
          </p>
        </div>
      ),
    },
    {
      title: 'Reviews',
      count: 46,
      content: (
        <div>
          <h2 className="text-lg font-semibold">Reviews</h2>
          {/* Reviews content goes here */}
        </div>
      ),
    },
  ];

  return (
    <div className="border-gray-200 ">
      <ul className="flex border-b bg-gray-secondary-500">
        {tabs.map((tab) => (
          <li
            key={tab.title}
            className={`flex text-center p-4 cursor-pointer ${
              activeTab === tab.title.toLowerCase() ? 'border-primary-400 bg-primary-400 text-white-primary-400' : 'border-transparent'
            }`}
            onClick={() => setActiveTab(tab.title.toLowerCase())}
          >
            {tab.title} {tab.count ? `(${tab.count})` : ''}
          </li>
        ))}
      </ul>
      <div className="p-4">
        {tabs.find((tab) => tab.title.toLowerCase() === activeTab)?.content}
      </div>
    </div>
  );
};

export default DescriptionTabs;
