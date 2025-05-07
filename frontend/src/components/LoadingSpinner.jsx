import COLORS from '../lib/constants';
const LoadingSpinner = () => {
	return (
		<div style={{ backgroundColor: COLORS.DARK_GRAY }}className='flex items-center justify-center min-h-screen'
		>
			<div className='relative'>
				<div className='w-20 h-20 border-green-200 border-2 rounded-full' />
				<div className='w-20 h-20 border-green-500 border-t-2 animate-spin rounded-full absolute left-0 top-0' />
				<div className='sr-only'>Loading</div>
			</div>
		</div>
	);
};

export default LoadingSpinner;