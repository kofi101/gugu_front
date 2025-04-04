import AuthForgotPassword from "../../components/auth/AuthForgotPassword"
import AppHeroImage from "../../shared/AppHeroImage"

const ForgotPassword = () => {
  return (
    <div className="flex items-center w-full h-full">
      <div className="items-center justify-center hidden w-1/2 h-full mx-auto md:flex bg-primary-400">
        <AppHeroImage />
      </div>
      <div className="flex flex-col justify-center w-full h-full px-4 md:items-center md:w-1/2">
        <AuthForgotPassword />
      </div>
    </div>
  )
}

export default ForgotPassword