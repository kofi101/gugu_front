import {apploaderProp} from "../helpers/type/types"
import "../styles/AppCustomCss.css"

const AppLoader:React.FC<apploaderProp> = ({height, width}) => {
  return (
    <div className={`flex justify-center`}>
      <div style={{height,  width}}>
        <div className="spinner" style={{height, width}}></div>
      </div>
    </div>
  )
}

export default AppLoader