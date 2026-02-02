export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8 h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
