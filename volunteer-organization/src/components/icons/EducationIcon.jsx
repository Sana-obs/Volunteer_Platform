export default function EducationIcon({ className = "", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g clipPath="url(#clip0)">
        <mask
          id="mask0"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="48"
          height="48"
        >
          <path d="M0 0H48V48H0V0Z" fill="white" />
        </mask>

        <g mask="url(#mask0)">
          <path
            d="M7.03125 12.6563H1.40625V43.7813H14.3038C16.8505 43.7813 19.293 44.7929 21.0937 46.5938H26.9062C28.707 44.7929 31.1495 43.7813 33.6962 43.7813H46.5937V15.4688H40.9687"
            stroke="currentColor"
            strokeWidth="2"
            strokeMiterlimit="10"
          />
          <path
            d="M24 12.6563H24.8813C27.4406 10.828 30.4782 9.84375 33.6843 9.84375H40.9687V38.1563H33.6843C30.4782 38.1563 27.4406 39.1405 24.8813 40.9688H23.1187C20.5594 39.1405 17.5218 38.1563 14.3157 38.1563H7.03125V7.03125H12.6562"
            stroke="currentColor"
            strokeWidth="2"
            strokeMiterlimit="10"
          />
          <path
            d="M12.6562 1.40625V29.7188C18.8695 29.7188 24 34.7555 24 40.9688V12.6563C24 6.44297 18.8695 1.40625 12.6562 1.40625Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeMiterlimit="10"
          />
        </g>
      </g>

      <defs>
        <clipPath id="clip0">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
