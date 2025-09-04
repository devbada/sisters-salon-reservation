// Mock reservation data for testing the POST route
// Each object contains the required fields: customerName, date, time, stylist, and serviceType

const mockReservations = [
  {
    customerName: "Kim Minjae",
    date: "2023-11-15",
    time: "10:00",
    stylist: "John",
    serviceType: "Haircut"
  },
  {
    customerName: "Park Sooyoung",
    date: "2023-11-16",
    time: "14:30",
    stylist: "Sarah",
    serviceType: "Color"
  },
  {
    customerName: "Lee Jieun",
    date: "2023-11-17",
    time: "11:15",
    stylist: "Michael",
    serviceType: "Styling"
  },
  {
    customerName: "Choi Woo-shik",
    date: "2023-11-18",
    time: "16:00",
    stylist: "Emily",
    serviceType: "Treatment"
  },
  {
    customerName: "Jung Hoseok",
    date: "2023-11-19",
    time: "13:45",
    stylist: "John",
    serviceType: "Haircut"
  }
];

module.exports = mockReservations;