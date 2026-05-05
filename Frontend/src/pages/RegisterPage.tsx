import { useContext, useState } from "react";
import InputText from "../components/universal/InputText";
import InputPassword from "../components/universal/InputPassword";
import Button from "../components/universal/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { handleFetchError } from "../lib/actions/HandleError";
import CustomAxios from "../lib/actions/CustomAxios";
import { IUserForm } from "../lib/types/User";
import { CurrentUserContext } from "../lib/contexts/CurrentUserContext";
import EldCareLogo from "../../public/eldcarelogo.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const currentUserContext = useContext(CurrentUserContext);
  const [formData, setFormData] = useState<IUserForm>({
    username: "",
    password: "",
    medBoxID: "",
    medBoxPassword: "",
    displayName: "",
    role: "caretaker",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((oldFd) => ({
      ...oldFd,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await CustomAxios("post", "/auth/sign-up", formData);
      const { token, user } = data;
      localStorage.setItem("access_token", token);
      currentUserContext?.setCurrentUser(user);
      navigate("/");
    } catch (error) {
      handleFetchError(error);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center px-4 py-6 bg-gradient-to-b from-[#B3CEFF] to-#FFFFFF">
      <div className="flex flex-row items-center gap-32">
        <div className="flex flex-col items-center">
          <img src={EldCareLogo} width="120%"/>
          <div className="flex flex-col items-center">
            <p className="text-blue-900 font-light">Helping elderly manage medication</p>
            <p className="text-blue-900 font-light">easily and safely</p>
          </div>
        </div>
        <div>
          <form
            action="post"
            onSubmit={onSubmit}
            className="mx-auto flex h-fit w-full max-w-[700px] flex-col gap-2 rounded-xl border-[1px] py-10 shadow-lg md:px-8 bg-gradient-to-b from-[#FFFFFF] to-[#B3CEFF]"
          >
            <h1 className="text-center text-2xl font-semibold text-blue-900">Register</h1>
            <p className="text-sm">Email</p>
            <InputText
              value={formData.email as string}
              onChange={onChange}
              name="email"
              placeholder="Email"
              className="border-black rounded-xl bg-slate-100"
            />
            <p className="text-sm">Password</p>
            <InputPassword
              value={formData.password as string}
              onChange={onChange}
              name="password"
              placeholder="Password"
              className="border-black rounded-xl bg-slate-100"
            />
            <p className="text-sm">MedBox ID</p>
            <InputText
              value={formData.medBoxID as string}
              onChange={onChange}
              name="medBoxID"
              placeholder="MedBox ID"
              className="border-black rounded-xl bg-slate-100"
            />
            <p className="text-sm">MedBox Password</p>
            <InputPassword
              value={formData.medBoxPassword as string}
              onChange={onChange}
              name="medBoxPassword"
              placeholder="MedBox Password"
              className="border-black rounded-xl bg-slate-100"
            />
            <div className="py-3"></div>
            <Button>Continue</Button>
            <div className="mx-auto flex gap-2 text-sm">
              <p>Already have an account?</p>
              <NavLink to="/auth/sign-in" className="text-green-700 duration-300">
                Sign in!
              </NavLink>
            </div>
            <NavLink to="/" className="w-full">
              <Button className="w-full bg-green-200 text-black hover:bg-green-300">
                Continue With Google
              </Button>
            </NavLink>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
