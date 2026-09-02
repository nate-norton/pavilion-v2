import { Component, type ReactNode } from 'react';
import { usePavStore, initialState } from '../store/store';

export interface ErrorBoundaryProps {
  children?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
}

/** Catches render errors inside the phone frame and offers a demo reset. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleRestart = () => {
    const next = usePavStore.getState().epoch + 1;
    usePavStore.setState({ ...initialState, epoch: next }, true);
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="pav-fixed absolute inset-0 z-[200] flex items-center justify-center bg-mist p-6">
          <div className="bg-paper rounded-[20px] px-6 py-7 text-center flex flex-col items-center gap-3 max-w-[280px]">
            <p className="m-0 font-serif text-[19px] text-navy">Something went sideways.</p>
            <p className="m-0 text-[13px] text-slatedark leading-[1.5]">
              The demo hit a snag. You can restart it fresh from here.
            </p>
            <button
              type="button"
              onClick={this.handleRestart}
              className="border-0 bg-skydeep text-mist rounded-[12px] px-5 py-2.5 text-[13px] font-extrabold cursor-pointer font-sans"
            >
              Restart demo
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
