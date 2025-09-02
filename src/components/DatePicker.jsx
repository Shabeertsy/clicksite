import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

function DatePicker({ value, onChange }) {
  return (
    <Flatpickr
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
