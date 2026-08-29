import { useRef, useState } from "react"
import { Camera, Building2, User, Upload, X } from "lucide-react"
import ClickableAvatar from "./ClickableAvatar"
import NavbarDropdown from "../ui/NavbarDropdown"

const SHAPE_CLASSES = {
  circle: "rounded-full",
  square: "rounded-2xl",
}

const SIZE_CLASSES = {
  sm: "w-16 h-16",
  md: "w-24 h-24 md:w-28 md:h-28",
  lg: "w-32 h-32 md:w-40 md:h-40",
}

export default function ImageUploader({
  previewUrl,
  onFileChange,
  // optional — enables "Remove photo" in the edit menu
  onRemove,
  shape = "circle",
  size = "md",
  fallbackIcon = "user",
  fallbackText,
  disabled = false,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const fileInputRef = useRef(null)

  const FallbackIcon =
    fallbackIcon === "organization" ? Building2 : fallbackIcon === "upload" ? Upload : User

  const preview = (
    <div
      className={`${SIZE_CLASSES[size]} ${SHAPE_CLASSES[shape]} overflow-hidden border border-heading/10 flex items-center justify-center ${!previewUrl ? 'bg-primary/10' : ''}`}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Profile"
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.03]"
        />
      ) : fallbackText ? (
        <span className="text-primary font-bold text-2xl">{fallbackText}</span>
      ) : (
        <FallbackIcon className="text-primary/50" size={30} />
      )}
    </div>
  )

  return (
    <div className="relative inline-block">
      {/* When disabled, this is a thumbnail inside a larger control (e.g. UploadRow's
          label) — skip ClickableAvatar so its <button> doesn't nest in a <label>. */}
      {disabled ? (
        preview
      ) : (
        <ClickableAvatar src={previewUrl} alt="Profile photo">
          {preview}
        </ClickableAvatar>
      )}

      {!disabled && (
        <div className="absolute -bottom-2 -right-2">
          <NavbarDropdown
            trigger={
              <span className="w-10 h-10 rounded-full bg-field border border-heading/10 flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Camera size={16} className="text-primary" />
              </span>
            }
            triggerAriaLabel="Edit photo"
            isOpen={isMenuOpen}
            setIsOpen={setIsMenuOpen}
            align="right"
            width="w-44"
            items={[
              {
                name: "Change photo",
                icon: Camera,
                onClick: () => {
                  setIsMenuOpen(false)
                  fileInputRef.current?.click()
                },
              },
              ...(onRemove && previewUrl
                ? [{
                    name: "Remove photo",
                    icon: X,
                    destructive: true,
                    onClick: () => {
                      setIsMenuOpen(false)
                      onRemove()
                    },
                  }]
                : []),
            ]}
          />
        </div>
      )}

      {!disabled && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onFileChange}
        />
      )}
    </div>
  )
}