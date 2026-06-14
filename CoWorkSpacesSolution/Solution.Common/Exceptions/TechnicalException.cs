namespace Solution.Common.Exceptions
{
    public class TechnicalException : global::System.Exception
    {
        public string ErrorCode { get; set; }

        public TechnicalException(string errorCode, string message) : base(message)
        {
            ErrorCode = errorCode;
        }
    }
}
