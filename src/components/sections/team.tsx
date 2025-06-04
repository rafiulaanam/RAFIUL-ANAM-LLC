"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Linkedin, Twitter, Mail } from "lucide-react";

const team = [
  {
    name: "David Anderson",
    role: "CEO & Founder",
    image: "/team/david.jpg",
    bio: "With over 15 years of experience in e-commerce, David leads our company's vision and strategy.",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "david@example.com",
    },
  },
  {
    name: "Jessica Zhang",
    role: "Head of Operations",
    image: "/team/jessica.jpg",
    bio: "Jessica ensures smooth operations and exceptional customer experience across all our services.",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "jessica@example.com",
    },
  },
  {
    name: "Marcus Brown",
    role: "Tech Lead",
    image: "/team/marcus.jpg",
    bio: "Marcus oversees our technical infrastructure and drives innovation in our digital platforms.",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "marcus@example.com",
    },
  },
  {
    name: "Sophie Carter",
    role: "Customer Success",
    image: "/team/sophie.jpg",
    bio: "Sophie leads our customer success team, ensuring client satisfaction at every touchpoint.",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "sophie@example.com",
    },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Team() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get to know the dedicated professionals working behind the scenes to bring you the best shopping experience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {team.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="bg-gray-50 rounded-xl p-6 relative">
                <div className="relative w-full aspect-square mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {member.bio}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <a
                      href={member.social.linkedin}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={member.social.twitter}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${member.social.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-primary/10 rounded-xl -z-10 transform rotate-2 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 