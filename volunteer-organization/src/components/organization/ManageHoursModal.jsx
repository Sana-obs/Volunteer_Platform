
import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function ManageHoursModal({
  open,
  onClose,
  onConfirm,
  volunteerName,
  committedHours,
  currentHoursLogged,
  isSubmitting,
}) {
  const [hours, setHours] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const hasConfirmedHours =
      currentHoursLogged !== null && currentHoursLogged !== undefined;

    setHours(
      hasConfirmedHours
        ? currentHoursLogged
        : committedHours ?? "",
    );
    setError("");
  }, [open, currentHoursLogged, committedHours]);

  const handleConfirm = () => {
    const value = Number(hours);
    if (!Number.isFinite(value) || value < 0) {
      setError("Please enter a valid number of hours.");
      return;
    }
    setError("");
    onConfirm(value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Confirm hours for ${volunteerName || "volunteer"}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} isLoading={isSubmitting} loadingText="Saving...">
            Confirm hours
          </Button>
        </>
      }
    >
      <p className="mb-4">
        This volunteer committed to <strong>{committedHours}</strong> hours when joining. Confirm
        the actual hours they completed, or adjust if it differs.
      </p>

      <Input
        label="Actual hours completed"
        name="actualHours"
        type="number"
        min={0}
        value={hours}
        onChange={(event) => setHours(event.target.value)}
        error={error}
        fullWidth
        required
      />
    </Modal>
  );
}