// BarcodePrint.jsx (বিকল্প সমাধানের জন্য)
import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

const BarcodeContent = ({ barcode }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (barcode && svgRef.current) {
      JsBarcode(svgRef.current, barcode, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
      });
    }
  }, [barcode]);

  return (
    <div id="barcode-print-area" className="p-4 flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarcodeContent; 