
import NotFound from '../../assets/images/404.jpg'

const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center ">
        <img src={NotFound} alt="Page not found" className="h-[480px] object-cover" />
    </div>
  )
}

export default PageNotFound