
import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function ParticipateHoursModal({
  open,
  onClose,
  onConfirm,
  minHours,
  maxHours,
  submitting = false,
  serverError = "",
}) {
  const [hours, setHours] = useState(minHours);
  const [localError, setLocalError] = useState("");

  function handleConfirm() {
    const value = Number(hours);
    if (!Number.isFinite(value) || value < minHours || value > maxHours) {
      setLocalError(`Please enter a number between ${minHours} and ${maxHours} hours.`);
      return;
    }
    setLocalError("");
    onConfirm(value);
  }

  const displayedError = serverError || localError;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hours you can commit"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} isLoading={submitting} loadingText="Joining...">
            Confirm & Join
          </Button>
        </>
      }
    >
      <p className="mb-4">
        This opportunity requires between <strong>{minHours}</strong> and{" "}
        <strong>{maxHours}</strong> hours per volunteer. Enter the number of hours you can commit
        to it.
      </p>

      <Input
        label={`Hours you can commit (${minHours}–${maxHours})`}
        name="committedHours"
        type="number"
        min={minHours}
        max={maxHours}
        value={hours}
        onChange={(event) => setHours(event.target.value)}
        error={displayedError}
        fullWidth
        required
      />
    </Modal>
  );
}