type Props = {
  children: React.ReactNode
}

const FormTitle = ({ children }: Props) => {
  return (
    <h2 className="text-2xl font-bold uppercase bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
      {children}
    </h2>
  )
}

export default FormTitle
