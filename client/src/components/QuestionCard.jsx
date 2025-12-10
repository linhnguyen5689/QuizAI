const QuestionCard = ({
  question,
  selectedOption,
  onSelectOption
}) => {
  if (!question) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-red-500">Error: Question data is missing</p>
      </div>
    );
  }

  const options = question.options || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <p className="text-gray-700">{question.content || question.text || 'No question text available'}</p>
      </div>

      <div className="space-y-3">
        {options.length > 0 ? (
          options.map((option, index) => {
            const optionClass = `border rounded-lg p-3 cursor-pointer flex items-center ${selectedOption === index
                ? "bg-indigo-100 border-indigo-300"
                : "hover:bg-gray-50 border-gray-200"
              }`;

            return (
              <div
                key={index}
                className={optionClass}
                onClick={() => onSelectOption(index)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    <span>{option.label || option.text || `Option ${index + 1}`}</span>
                  </div>
                </div>

                {selectedOption === index && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="border rounded-lg p-3 text-gray-500">
            No options available for this question
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;