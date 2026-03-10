import { CopyrightOutlined } from "@ant-design/icons";

const Footer = () => {
  return (
    <footer className="border-t border-[#d9e7c8] bg-[#fefffc]/90 px-6 py-4 text-[#6d8060] backdrop-blur-xl">
      <div className="flex flex-col items-center justify-between gap-2 text-sm md:flex-row">
        <p className="inline-flex items-center gap-1.5">
          <CopyrightOutlined className="text-[#4f6841]" />
          <span>{new Date().getFullYear()} Medico. All rights reserved.</span>
        </p>

        <div className="flex gap-5">
          <span className="cursor-pointer transition hover:text-[#3a592b]">Privacy</span>
          <span className="cursor-pointer transition hover:text-[#3a592b]">Terms</span>
          <span className="cursor-pointer transition hover:text-[#3a592b]">Support</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
