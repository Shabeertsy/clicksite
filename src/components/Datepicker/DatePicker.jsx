import Flatpickr from "react-flatpickr";

export default function DatePicker({ value, onChange }) {
  return (
      <Flatpickr
        className="form-control"
        style={{ fontWeight: 400 }}
        value={value}
        onChange={onChange}
        options={{
          enableTime: true,
          dateFormat: "d-m-Y H:i",
          minDate: "today"
        }}
      />
  );
}
