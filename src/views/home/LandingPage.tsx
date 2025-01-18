


import AppHeroImage from "../../shared/AppHeroImage"
const HomePage = () => {
  return (
    <div className="flex items-center w-full h-screen">
      <div className="hidden w-1/2 h-full md:block">
        <AppHeroImage/>
      </div>
      <div className="flex flex-col items-center justify-center h-full md:w-1/2">
        {/* <LandPageComponent /> */}
      </div>
    </div>
  )
}

export default HomePage