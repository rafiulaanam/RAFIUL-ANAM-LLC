import Image from "next/image";
import { Github, Linkedin, Twitter } from "lucide-react";

const team = [
  {
    name: "John Smith",
    role: "CEO & Founder",
    image: "/images/man.png",
    bio: "With over 15 years of experience in e-commerce and retail innovation.",
    social: {
      twitter: "https://twitter.com/johnsmith",
      linkedin: "https://linkedin.com/in/johnsmith",
      github: "https://github.com/johnsmith",
    },
  },
  {
    name: "Sarah Johnson",
    role: "Head of Design",
    image: "/images/man.png",
    bio: "Leading our design team with a passion for creating beautiful user experiences.",
    social: {
      twitter: "https://twitter.com/sarahjohnson",
      linkedin: "https://linkedin.com/in/sarahjohnson",
      github: "https://github.com/sarahjohnson",
    },
  },
  {
    name: "Michael Chen",
    role: "CTO",
    image: "/images/man.png",
    bio: "Tech visionary with a track record of building scalable e-commerce platforms.",
    social: {
      twitter: "https://twitter.com/michaelchen",
      linkedin: "https://linkedin.com/in/michaelchen",
      github: "https://github.com/michaelchen",
    },
  },
  {
    name: "Emma Davis",
    role: "Head of Marketing",
    image: "/images/man.png",
    bio: "Digital marketing expert specializing in e-commerce growth strategies.",
    social: {
      twitter: "https://twitter.com/emmadavis",
      linkedin: "https://linkedin.com/in/emmadavis",
      github: "https://github.com/emmadavis",
    },
  },
];

export default function Team() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-muted-foreground">
            The passionate individuals behind our success, working together to bring you the best shopping experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center"
            >
              <div className="relative h-40 w-40 mx-auto mb-6">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-primary font-medium mb-3">{member.role}</p>
              <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
              <div className="flex justify-center gap-4">
                <a
                  href={member.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href={member.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 