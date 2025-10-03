import { Link } from 'react-router-dom';
import { HeartIcon, CakeIcon, SparklesIcon, UserGroupIcon, DocumentPlusIcon } from '@heroicons/react/24/solid';

const Card = ({ to, title, Icon, description }) => (
  <Link to={to} className="group rounded-2xl bg-white shadow-2xl hover:shadow-[0_0_24px_rgba(30,144,255,0.35)] transition transform hover:scale-105 text-center p-6 cursor-pointer border border-transparent hover:border-[#1E90FF]/30">
    <div className="flex flex-col items-center gap-3">
      <Icon className="w-12 h-12 text-[#8A2BE2] group-hover:text-[#1E90FF] transition" />
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </Link>
);

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent">Dashboard</h1>
      
      {/* Family Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Family Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card to="/family/tree" title="Family Tree" Icon={UserGroupIcon} description="View your family tree" />
          <Card to="/family/form" title="Family Form" Icon={DocumentPlusIcon} description="Add family members" />
        </div>
      </div>

      {/* Photos Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Photo Albums</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card to="/album/marriage" title="Marriage" Icon={HeartIcon} description="Wedding memories" />
          <Card to="/album/birthday" title="Birthday" Icon={CakeIcon} description="Birthday celebrations" />
          <Card to="/album/other" title="Other Occasion" Icon={SparklesIcon} description="Special moments" />
        </div>
      </div>
    </div>
  );
}
