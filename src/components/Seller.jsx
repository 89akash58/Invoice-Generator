import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

const InvoiceForm = () => {
  const [sellerDetails, setSellerDetails] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    panNo: Number,
    gstregistration: "",
  });

  const [billingDetails, setBillingDetails] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: Number,
    stateUTCode: "",
  });

  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: Number,
    stateUTCode: "",
  });
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [placeOfDelivery, setPlaceOfDelivery] = useState("");
  const [orderDetails, setOrderDetails] = useState({
    orderNo: Number,
    orderDate: Date,
  });
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNo: Number,
    invoiceDetails: "",
    invoiceDate: Date,
  });
  const [items, setItems] = useState([]);

  const handleAddItem = (event) => {
    event.preventDefault();
    setItems([
      ...items,
      {
        description: "",
        unitPrice: "",
        quantity: "",
        discount: "",
        netAmount: "",
        taxRate: "",
        taxType: "",
        taxAmount: "",
        totalAmount: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const calculateTotal = (item) => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const quantity = parseFloat(item.quantity) || 0;
    const discount = parseFloat(item.discount) || 0;
    return unitPrice * quantity - discount;
  };

  const calculateTax = (item) => {
    let taxRate = parseFloat(item.taxRate) || 0;
    let netAmount = calculateTotal(item);

    if (placeOfSupply === placeOfDelivery) {
      item.taxType = "CGST+SGST";
      taxRate = 9; // 9% each for CGST and SGST
      item.taxRate = taxRate;
    } else {
      item.taxType = "IGST";
      taxRate = 18; // 18% for IGST
      item.taxRate = taxRate;
    }

    return (netAmount * taxRate) / 100;
  };

  const calculateNetAmount = (item) => {
    const netAmount = calculateTotal(item);
    const taxAmount = calculateTax(item);
    return netAmount + taxAmount;
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        document.getElementById("logo-container").appendChild(img);
      };
    };

    reader.readAsDataURL(file);
  };
  const handleSignatureChange = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        document.getElementById("signature-container").appendChild(img);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleInvoiceDetailsChange = (event) => {
    const { name, value } = event.target;
    setInvoiceDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderDetailsChange = (event) => {
    const { name, value } = event.target;
    setOrderDetails((prev) => ({ ...prev, [name]: value }));
  };
  // Add new handlers for these inputs
  const handlePlaceOfSupplyChange = (event) => {
    setPlaceOfSupply(event.target.value);
  };

  const handlePlaceOfDeliveryChange = (event) => {
    setPlaceOfDelivery(event.target.value);
  };

  const handleSellerInputChange = (event) => {
    const { name, value } = event.target;
    setSellerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingInputChange = (event) => {
    const { name, value } = event.target;
    setBillingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingInputChange = (event) => {
    const { name, value } = event.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    generatePdf();
  };

  const generatePdf = async (event) => {
    const doc = new jsPDF();
    const logoContainer = document.getElementById("logo-container");
    if (logoContainer.children.length > 0) {
      await html2canvas(logoContainer.children[0]).then((canvas) => {
        const logoImage = canvas.toDataURL("image/png");
        doc.addImage(logoImage, "PNG", 10, 10, 50, 20);
      });
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text("Tax Invoice/Bill of Supply/Cash Memo", 105, 20, {
      align: "left",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    //Seller Details
    const startY = 40;
    const lineHeight = 4;
    const rightAlignedX = 130;

    doc.text("Seller Details:", 20, startY, { align: "left" });
    doc.text(`${sellerDetails.name}`, 20, startY + lineHeight);
    doc.text(`${sellerDetails.address}`, 20, startY + 2 * lineHeight);
    doc.text(
      `${sellerDetails.city}, ${sellerDetails.state}, ${sellerDetails.pincode}`,
      20,
      startY + 3 * lineHeight
    );
    doc.text(`PanNo: ${sellerDetails.panNo}`, 20, startY + 5 * lineHeight);
    doc.text(
      `GST Registration: ${sellerDetails.gstregistration}`,
      20,
      startY + 6 * lineHeight
    );

    // Add billing details
    const orderStartY = startY + 60;

    doc.setFont("helvetica", "bold");
    doc.text("Order Details:", 20, orderStartY);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Order No.: ${orderDetails.orderNo}`,
      20,
      orderStartY + lineHeight
    );
    doc.text(
      `Order Date: ${orderDetails.orderDate}`,
      20,
      orderStartY + 2 * lineHeight
    );

    doc.text("Billing Details:", 130, startY);
    doc.text(`${billingDetails.name}`, 130, startY + lineHeight);
    doc.text(`${billingDetails.address}`, 130, startY + 2 * lineHeight);
    doc.text(
      `${billingDetails.city}, ${billingDetails.state}, ${billingDetails.pincode}`,
      130,
      startY + 3 * lineHeight
    );
    doc.text(
      `State/UT Code:${billingDetails.stateUTCode}`,
      130,
      startY + 4 * lineHeight
    );

    // Add shipping details
    const shippingStartY = startY + 30;

    doc.text("Shipping Details:", rightAlignedX, shippingStartY, {
      align: "left",
    });
    doc.text(
      `Name: ${shippingDetails.name}`,
      rightAlignedX,
      shippingStartY + lineHeight,
      { align: "left" }
    );
    doc.text(
      `Address: ${shippingDetails.address}`,
      rightAlignedX,
      shippingStartY + 2 * lineHeight,
      { align: "left" }
    );
    doc.text(
      `${shippingDetails.city}, ${shippingDetails.state}, ${shippingDetails.pincode}`,
      rightAlignedX,
      shippingStartY + 3 * lineHeight,
      { align: "left" }
    );
    doc.text(
      `State/UT Code: ${shippingDetails.stateUTCode}`,
      rightAlignedX,
      shippingStartY + 4 * lineHeight,
      { align: "left" }
    );

    //place of supply
    const placeDetailsStartY = shippingStartY + 25;
    doc.setFont("helvetica", "bold");
    doc.text("Place of Supply:", rightAlignedX, placeDetailsStartY, {
      align: "left",
    });
    doc.setFont("helvetica", "normal");
    doc.text(placeOfSupply, rightAlignedX + 30, placeDetailsStartY, {
      align: "left",
    });

    doc.setFont("helvetica", "bold");
    doc.text(
      "Place of Delivery:",
      rightAlignedX,
      placeDetailsStartY + lineHeight,
      { align: "left" }
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      placeOfDelivery,
      rightAlignedX + 35,
      placeDetailsStartY + lineHeight,
      { align: "left" }
    );

    const invoiceDetailsStartY = placeDetailsStartY + 3 * lineHeight; // 10 units gap after Place of Delivery

    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details:", rightAlignedX, invoiceDetailsStartY, {
      align: "left",
    });
    doc.setFont("helvetica", "normal");
    doc.text(
      `Invoice No.: ${invoiceDetails.invoiceNo}`,
      rightAlignedX,
      invoiceDetailsStartY + lineHeight,
      { align: "left" }
    );
    doc.text(
      `Invoice Details: ${invoiceDetails.invoiceDetails}`,
      rightAlignedX,
      invoiceDetailsStartY + 2 * lineHeight,
      { align: "left" }
    );
    doc.text(
      `Invoice Date: ${invoiceDetails.invoiceDate}`,
      rightAlignedX,
      invoiceDetailsStartY + 3 * lineHeight,
      { align: "left" }
    );
    const tableData = items.map((item) => [
      item.description,
      item.unitPrice,
      item.quantity,
      item.discount,
      calculateTotal(item),
      item.taxRate,
      item.taxType,
      calculateTax(item),
      calculateNetAmount(item),
    ]);

    // const totalNetAmount = items.reduce(
    //   (sum, item) => sum + calculateTotal(item),
    //   0
    // );
    // const totalTaxAmount = items.reduce(
    //   (sum, item) => sum + calculateTax(item),
    //   0
    // );
    const total = items.reduce(
      (sum, item) => sum + calculateNetAmount(item),
      0
    );

    doc.setFontSize(12);
    doc.autoTable({
      head: [
        [
          "Description",
          "Unit Price",
          "Quantity",
          "Discount",
          "Net Amount",
          "Tax Rate",
          "Tax Type",
          "Tax Amount",
          "Total Amount",
        ],
      ],
      body: tableData,
      startY: 130,
    });

    doc.text(`Total: ${total}`, 20, 180);
    const signatureContainer = document.getElementById("signature-container");
    if (signatureContainer.children.length > 0) {
      await html2canvas(signatureContainer.children[0]).then((canvas) => {
        const signatureImage = canvas.toDataURL("image/png");
        doc.addImage(
          signatureImage,
          "PNG",
          150,
          doc.lastAutoTable.finalY + 30,
          30,
          10
        );
        doc.setFontSize(10);
        doc.text("Authorized Signature", 150, 200);
      });
    }
    doc.save(`invoice.pdf`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Invoice Generator</h1>
      <div className="logo">
        <h3>Company Logo</h3>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
        <div id="logo-container" />
      </div>
      <div className="seller">
        <h3>Seller Details</h3>
        <input
          type="text"
          name="name"
          value={sellerDetails.name}
          onChange={handleSellerInputChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="address"
          value={sellerDetails.address}
          onChange={handleSellerInputChange}
          placeholder="Address"
        />
        <input
          type="text"
          name="city"
          value={sellerDetails.city}
          onChange={handleSellerInputChange}
          placeholder="City"
        />
        <input
          type="text"
          name="state"
          value={sellerDetails.state}
          onChange={handleSellerInputChange}
          placeholder="State"
        />
        <input
          type="text"
          name="pincode"
          value={sellerDetails.pincode}
          onChange={handleSellerInputChange}
          placeholder="Pincode"
        />
        <input
          type="text"
          name="panNo"
          value={sellerDetails.panNo}
          onChange={handleSellerInputChange}
          placeholder="PAN No"
        />
        <input
          type="text"
          name="gstregistration"
          value={sellerDetails.gstregistration}
          onChange={handleSellerInputChange}
          placeholder="GST Registration"
        />
      </div>

      <div className="billing">
        <h3>Billing Details</h3>
        <input
          type="text"
          name="name"
          value={billingDetails.name}
          onChange={handleBillingInputChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="address"
          value={billingDetails.address}
          onChange={handleBillingInputChange}
          placeholder="Address"
        />
        <input
          type="text"
          name="city"
          value={billingDetails.city}
          onChange={handleBillingInputChange}
          placeholder="City"
        />
        <input
          type="text"
          name="state"
          value={billingDetails.state}
          onChange={handleBillingInputChange}
          placeholder="State"
        />
        <input
          type="text"
          name="pincode"
          value={billingDetails.pincode}
          onChange={handleBillingInputChange}
          placeholder="Pincode"
        />
        <input
          type="text"
          name="stateUTCode"
          value={billingDetails.stateUTCode}
          onChange={handleBillingInputChange}
          placeholder="State/UT Code"
        />
      </div>
      <div className="shipping">
        <h3>Shipping Details</h3>
        <input
          type="text"
          name="name"
          value={shippingDetails.name}
          onChange={handleShippingInputChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="address"
          value={shippingDetails.address}
          onChange={handleShippingInputChange}
          placeholder="Address"
        />
        <input
          type="text"
          name="city"
          value={shippingDetails.city}
          onChange={handleShippingInputChange}
          placeholder="City"
        />
        <input
          type="text"
          name="state"
          value={shippingDetails.state}
          onChange={handleShippingInputChange}
          placeholder="State"
        />
        <input
          type="text"
          name="pincode"
          value={shippingDetails.pincode}
          onChange={handleShippingInputChange}
          placeholder="Pincode"
        />
        <input
          type="text"
          name="stateUTCode"
          value={shippingDetails.stateUTCode}
          onChange={handleShippingInputChange}
          placeholder="State/UT Code"
        />
      </div>
      <div className="place-details">
        <h3>Additional Details</h3>
        <input
          type="text"
          name="placeOfSupply"
          value={placeOfSupply}
          onChange={handlePlaceOfSupplyChange}
          placeholder="Place of Supply"
        />
        <input
          type="text"
          name="placeOfDelivery"
          value={placeOfDelivery}
          onChange={handlePlaceOfDeliveryChange}
          placeholder="Place of Delivery"
        />
      </div>
      <div className="order-details">
        <h3>Order Details</h3>
        <input
          type="text"
          name="orderNo"
          value={orderDetails.orderNo}
          onChange={handleOrderDetailsChange}
          placeholder="Order No."
        />
        <input
          type="date"
          name="orderDate"
          value={orderDetails.orderDate}
          onChange={handleOrderDetailsChange}
          placeholder="Order Date"
        />
      </div>
      <div className="invoice-details">
        <h3>Invoice Details</h3>
        <input
          type="text"
          name="invoiceNo"
          value={invoiceDetails.invoiceNo}
          onChange={handleInvoiceDetailsChange}
          placeholder="Invoice No."
        />
        <input
          type="text"
          name="invoiceDetails"
          value={invoiceDetails.invoiceDetails}
          onChange={handleInvoiceDetailsChange}
          placeholder="Invoice Details"
        />
        <input
          type="date"
          name="invoiceDate"
          value={invoiceDetails.invoiceDate}
          onChange={handleInvoiceDetailsChange}
          placeholder="Invoice Date"
        />
      </div>
      <div>
        <h2>Invoice Table</h2>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Discount</th>
              <th>Net Amount</th>
              <th>Tax Rate</th>
              <th>Tax Type</th>
              <th>Tax Amount</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleChange(index, "unitPrice", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      handleChange(index, "discount", e.target.value)
                    }
                  />
                </td>
                <td>{calculateTotal(item)}</td>
                <td>{item.taxRate}</td>
                <td>{item.taxType}</td>
                <td>{calculateTax(item)}</td>
                <td>{calculateNetAmount(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="add" style={{ textAlign: "center", margin: "10px" }}>
          <button
            onClick={handleAddItem}
            style={{
              background: "grey",
              color: "white",
              padding: "10px",
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            Add Item
          </button>
        </div>
      </div>
      <div className="sign">
        <input type="file" accept="image/*" onChange={handleSignatureChange} />
        <div id="signature-container" />
      </div>
      <div className="button" style={{ textAlign: "center" }}>
        <button
          type="submit"
          style={{
            background: "green",
            fontSize: "18px",
            color: "white",
            padding: "10px",
            width: "40%",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          Generate Invoice
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
