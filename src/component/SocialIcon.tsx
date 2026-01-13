import {
  FaSpotify,
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaSoundcloud,
} from "react-icons/fa";

type Props = {
  platform: "Spotify" | "SoundCloud" | "YouTube" | "Facebook" | "Instagram";
  className?: string; // <- Thêm dòng này
};

export default function SocialIcon({ platform }: Props) {
  switch (platform.toLowerCase()) {
    case "spotify":
      return <FaSpotify className="text-3xl group-hover:text-[#1DB954]" />;
    case "youtube":
      return <FaYoutube className="text-3xl group-hover:text-[#FF0000]" />;
    case "facebook":
      return <FaFacebook className="text-3xl group-hover:text-[#1877F2]" />;
    case "instagram":
      return <FaInstagram className="text-3xl group-hover:text-[#E4405F]" />;
    case "soundcloud":
      return <FaSoundcloud className="text-3xl group-hover:text-[#FF7700]" />;
    default:
      return <FaSpotify className="text-3xl group-hover:text-[#1DB954]" />;
  }
}
