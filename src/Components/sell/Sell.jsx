import { useContext, useState } from "react";
import "./sell.css";
import { AuthContext } from "../../store/Context";
import { storage } from "../../config/Firebase"; // Import storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import required functions
import { getFirestore, collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { useNavigate } from "react-router-dom";
import Spinner from "../Spinner/Spinner";

const Sell = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(null);
  const [image, setImage] = useState(null);
  const { user } = useContext(AuthContext); // Access current user from AuthContext
  const date = new Date();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const db = getFirestore();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (image) {
      const imageRef = ref(storage, `images/${image.name}`);
      uploadBytes(imageRef, image).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          console.log(url);
          addDoc(collection(db, "products"), {
            name,
            description,
            price,
            url,
            email: user.email,
            userId: user.uid,
            createdAt: date.toDateString(),
          })
            .then(() => {
              console.log("Product added successfully");
              navigate("/");
            })
            .catch((error) => console.error("Error adding product: ", error));
        });
      });
    } else {
      console.log("No image selected");
    }
  };

  return (
    <div className="full-page">
      {loading && <Spinner />}
      {!loading && (
        <div className="sell-product">
          <h2>Add Product</h2>
          <form className="add-product-form" onSubmit={handleSubmit}>
            <input
              placeholder="Product Name"
              type="text"
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Product Description"
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Price"
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            
            {image && (
              <img
                style={{ width: "40%", height: "20%" }}
                src={URL.createObjectURL(image)}
                alt="Product preview"
              />
            )}
            <input
              type="file"
              className="image"
              placeholder="Product Image"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
            <button type="submit" className="add-btn">
              Add Product
            </button>
          </form>
          <a href="/" className="redirect-link">
            Go to Home
          </a>
        </div>
      )}
    </div>
  );
};

export default Sell;
