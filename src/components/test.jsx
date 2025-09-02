import React from "react";
import useStore from "../store/authStore";



export default function Counter() {
  const { count, increase, decrease, reset } = useStore();

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">Count: {count}</h1>
      <div className="space-x-2 mt-4">
        <button onClick={increase} className="px-3 py-1 bg-green-500 text-white rounded">+</button>
        <button onClick={decrease} className="px-3 py-1 bg-red-500 text-white rounded">-</button>
        <button onClick={reset} className="px-3 py-1 bg-gray-500 text-white rounded">Reset</button>
      </div>
    </div>
  );
}
