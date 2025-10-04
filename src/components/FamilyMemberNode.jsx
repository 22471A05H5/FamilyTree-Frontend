import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const FamilyMemberNode = ({ data, selected }) => {
  const {
    name,
    dateOfBirth,
    dateOfDeath,
    gender,
    photo,
    occupation,
    onEdit,
    onDelete
  } = data;

  // Calculate age or age at death
  const calculateAge = () => {
    if (!dateOfBirth) return '';
    
    const birth = new Date(dateOfBirth);
    const end = dateOfDeath ? new Date(dateOfDeath) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    
    if (dateOfDeath) {
      return `(${age} years)`;
    }
    return `Age ${age}`;
  };

  // Gender-based styling
  const getGenderStyle = () => {
    switch (gender) {
      case 'male':
        return 'border-blue-300 bg-blue-50';
      case 'female':
        return 'border-pink-300 bg-pink-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`
      family-member-node relative bg-white rounded-xl shadow-lg border-2 p-4 min-w-[200px] max-w-[250px]
      ${selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      ${getGenderStyle()}
      hover:shadow-xl transition-all duration-200
    `}>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* Photo */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-2 border-2 border-white shadow-md">
          {photo?.url ? (
            <img
              src={photo.url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
              {gender === 'male' ? '👨' : gender === 'female' ? '👩' : '👤'}
            </div>
          )}
        </div>
        
        {/* Name */}
        <h3 className="font-semibold text-gray-800 text-center text-sm leading-tight">
          {name}
        </h3>
      </div>

      {/* Details */}
      <div className="text-xs text-gray-600 space-y-1">
        {dateOfBirth && (
          <div className="flex justify-between">
            <span>Born:</span>
            <span>{new Date(dateOfBirth).getFullYear()}</span>
          </div>
        )}
        
        {dateOfDeath && (
          <div className="flex justify-between">
            <span>Died:</span>
            <span>{new Date(dateOfDeath).getFullYear()}</span>
          </div>
        )}
        
        {calculateAge() && (
          <div className="text-center text-gray-500 italic">
            {calculateAge()}
          </div>
        )}
        
        {occupation && (
          <div className="text-center text-gray-600 font-medium">
            {occupation}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit();
          }}
          className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 flex items-center justify-center"
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
          className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
          title="Delete"
        >
          🗑️
        </button>
      </div>

      {/* Deceased indicator */}
      {dateOfDeath && (
        <div className="absolute top-1 left-1 text-xs text-gray-500">
          ✝️
        </div>
      )}
    </div>
  );
};

export default memo(FamilyMemberNode);
