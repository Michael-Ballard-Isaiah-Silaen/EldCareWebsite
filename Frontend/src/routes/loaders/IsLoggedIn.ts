import axios from "axios";
import { redirect } from "react-router-dom";
import Swal from "sweetalert2";
import { VITE_BACKEND_BASE_URL } from "../../lib/constant";

const IsLoggedIn = async () => {
  try {
    const fetchUser = async (accessToken?: string) => {
      // eslint-disable-next-line no-useless-catch
      try {
        const token = accessToken || localStorage.getItem("access_token");
        if(token){
          const { data: user } = await axios.get(
            `${VITE_BACKEND_BASE_URL}/auth/user-info`,
            {
              headers: {
                access_token: token,
              },
            },
          );
          return user;
        } 
        else {
          throw new Error("No access token found");
        }
      } catch(error) {
        throw error;
      }
    };

    const user = await fetchUser();
    return { user };
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please re-login",
    });
    localStorage.setItem("access_token", "");
    return redirect("/");
  }
};

export default IsLoggedIn;
