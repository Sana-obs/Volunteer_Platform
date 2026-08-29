// Generic "reason required" confirm modal; all copy comes from props.

import { useState } from "react";
import Modal from "../ui/Modal";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

/**
 * @param {{open:boolean, title:string, description?:string, placeholder?:string,
 *   onClose:()=>void, onConfirm:(reason:string)=>void, isSubmitting?:boolean}} props
 */
export default function RejectionReasonModal({
  open,
  title,
  description,
  placeholder,
  onClose,
  onConfirm,
  isSubmitting,
}) {
  const [reason, setReason] = useState("");
  const [hasAttemptedConfirm, setHasAttemptedConfirm] = useState(false);

  const trimmedReason = reason.trim();
  const reasonError = hasAttemptedConfirm && !trimmedReason ? "A reason is required." : "";

  const handleConfirm = () => {
    setHasAttemptedConfirm(true);

    if (!trimmedReason) return;

    onConfirm(trimmedReason);
    setReason("");
    setHasAttemptedConfirm(false);
  };

  const handleClose = () => {
    setReason("");
    setHasAttemptedConfirm(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isSubmitting || !trimmedReason}
            isLoading={isSubmitting}
            loadingText="Submitting..."
          >
            Confirm
          </Button>
        </>
      }
    >
      {description && <p className="mb-4 text-body">{description}</p>}

      <Textarea
        name="rejectionReason"
        placeholder={placeholder}
        rows={4}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        error={reasonError}
      />
    </Modal>
  );
}
