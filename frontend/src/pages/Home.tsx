const Home = (): JSX.Element => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to the Mentor-Mentee Portal
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">For Mentors</h2>
          <p className="text-gray-600 mb-4">
            Share your knowledge and experience with mentees. Help guide the next generation
            of professionals in their career journey.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">For Mentees</h2>
          <p className="text-gray-600 mb-4">
            Connect with experienced professionals in your field. Get guidance and support
            to achieve your career goals.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home 