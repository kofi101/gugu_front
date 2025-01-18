
import { textAreaProps } from '../helpers/interface/interfaces'

const AppTextArea: React.FC<textAreaProps> = ({label, error, className,onChange, ...props}) => {
  return (
    <div className="">
    {label && <label className="block mb-2 font-bold text-gray-700">{label}</label>}
    <textarea
      className={`${className} ${
        error ? 'border-red-primary-400' : 'border-gray-300'
      }`}
      onChange={onChange}
      {...props}
    />
    {error && <span className="mt-1 text-sm text-red-primary-400">{error}</span>}
  </div>
  )
}

export default AppTextArea