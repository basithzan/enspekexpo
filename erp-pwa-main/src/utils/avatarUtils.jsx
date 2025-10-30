// Avatar utility functions
export const getImageUrl = (profileImage, baseUrl = 'http://bc.test') => {
  if (!profileImage) return null;
  if (profileImage.startsWith('http')) return profileImage;
  return `${baseUrl}/${profileImage}`;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

export const AvatarComponent = ({ src, name, size = 'w-16 h-16', className = '' }) => {
  const imageUrl = getImageUrl(src);
  const initials = getInitials(name);

  return (
    <div className={`${size} rounded-full border-2 border-gray-200 bg-blue-500 flex items-center justify-center text-white font-semibold ${className}`}>
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={name}
            className={`${size} rounded-full object-cover border-2 border-gray-200`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div
            className={`${size} rounded-full border-2 border-gray-200 bg-blue-500 flex items-center justify-center text-white font-semibold`}
            style={{ display: 'none' }}
          >
            {initials}
          </div>
        </>
      ) : (
        initials
      )}
    </div>
  );
};


