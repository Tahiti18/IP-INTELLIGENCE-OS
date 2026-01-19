import ipaddress
import random
from typing import Tuple, Dict

class IntelligenceService:
    RIR_MAP = {
        "ARIN": "North America",
        "RIPE": "Europe / Middle East / Central Asia",
        "APNIC": "Asia Pacific",
        "LACNIC": "Latin America / Caribbean",
        "AFRINIC": "Africa"
    }

    @staticmethod
    def validate_and_parse(cidr: str) -> Tuple[bool, str, int, int]:
        try:
            network = ipaddress.ip_network(cidr, strict=False)
            return True, str(network), network.version, network.num_addresses
        except ValueError:
            return False, "", 0, 0

    @staticmethod
    def enrich_data(cidr_str: str) -> Dict:
        # In a real-world scenario, we'd query WHOIS APIs or RIR databases
        # Here we simulate the metadata enrichment for demo purposes
        rirs = list(IntelligenceService.RIR_MAP.keys())
        orgs = ["CloudFlare", "Amazon.com", "Google LLC", "T-Mobile USA", "Legacy Telecom Inc.", "Digital Ocean"]
        countries = ["US", "DE", "GB", "NL", "SG", "BR"]
        
        # Consistent seeding based on CIDR for deterministic results in demo
        random.seed(cidr_str)
        
        return {
            "rir": random.choice(rirs),
            "asn": f"AS{random.randint(100, 65000)}",
            "org_name": random.choice(orgs),
            "country": random.choice(countries),
        }

    @staticmethod
    def calculate_deal_score(network_version: int, num_addresses: int, rir: str, org_name: str) -> Tuple[float, str]:
        """
        Calculates a deal score from 0-100 and generates a detailed intelligence report.
        """
        score = 50.0
        explanations = []

        # Map RIR to descriptive region
        region_name = IntelligenceService.RIR_MAP.get(rir, rir)
        v_label = f"IPv{network_version}"
        
        # 1. Version Factor (Market Liquidity, Scarcity, and Future-Proofing)
        if network_version == 4:
            score += 25
            explanations.append(
                f"Protocol Intelligence: Identified as {v_label}. This asset commands premium market desirability due to the absolute exhaustion of the IANA free pool. "
                f"As a finite resource, {v_label} scarcity drives high secondary market liquidity and immediate valuation. "
                f"While not the future-proof protocol, its current critical role in global connectivity makes it a top-tier financial asset."
            )
        else:
            score -= 15
            explanations.append(
                f"Protocol Intelligence: Identified as {v_label}. This asset represents the pinnacle of future-proofing for next-generation networks and IoT scale. "
                f"However, due to the virtually unlimited supply of {v_label} address space, it lacks the 'forced scarcity' premium currently seen in IPv4. "
                f"Market interest is growing among large-scale cloud providers, though immediate liquidity is lower than legacy protocols."
            )

        # 2. Block Size Utility (BGP Routing & Aggregation)
        if num_addresses >= 65536: # /16
            score += 35
            explanations.append(
                f"Scale Assessment: This is a major {v_label} allocation (/16 or larger). Contiguous blocks of this magnitude are "
                f"exceptionally rare in the {v_label} ecosystem and command a significant 'aggregation premium' from global infrastructure providers."
            )
        elif num_addresses >= 256: # /24
            score += 15
            explanations.append(
                f"Scale Assessment: Standard {v_label} unit (/24) detected. This is the global 'gold standard' for BGP routing efficiency, "
                f"ensuring the {v_label} block can be advertised across all major internet transit providers without filtering."
            )
        else:
            score -= 10
            explanations.append(
                f"Scale Assessment: Small-footprint {v_label} block detected. Blocks smaller than a /24 often face aggressive global routing filters "
                f"on the public internet, which diminishes the standalone marketability of this {v_label} asset."
            )

        # 3. Regional/RIR Dynamics (Transfer Policy Complexity)
        if rir in ["ARIN", "RIPE"]:
            score += 10
            explanations.append(
                f"Registry Intelligence: Registered via {rir} ({region_name}). This jurisdiction features highly mature and predictable "
                f"transfer policies for {v_label}, significantly reducing regulatory friction and legal speed-bumps for acquisition."
            )
        elif rir == "APNIC":
            score += 5
            explanations.append(
                f"Registry Intelligence: Registered via {rir} ({region_name}). High demand in the APAC corridor ensures stable {v_label} valuation, "
                "though transfer workflows can involve unique regional compliance requirements."
            )
        elif rir == "AFRINIC":
            score -= 5
            explanations.append(
                f"Registry Intelligence: Registered via {rir} ({region_name}). Africa is a high-growth zone for {v_label} deployments; "
                "however, the current inter-regional transfer ecosystem is maturing, potentially impacting the speed of global liquidity."
            )
        elif rir == "LACNIC":
            score -= 5
            explanations.append(
                f"Registry Intelligence: Registered via {rir} ({region_name}). Latin America and Caribbean {v_label} policy frameworks are stable, "
                "but cross-regional transfers often require specific local legal validation, impacting the final deal timeline."
            )
        else:
            score -= 5
            explanations.append(
                f"Registry Intelligence: Registered via {rir} ({region_name}). General regional policy variations may introduce moderate "
                f"lead times for {v_label} transfers compared to the established North American or European corridors."
            )
        
        # 4. Asset Heritage (Legacy vs Non-Legacy)
        if "Legacy" in org_name or random.random() > 0.8: # Simulation of legacy detection
            score += 20
            explanations.append(
                f"Heritage Analysis: This {v_label} asset appears to be a 'Legacy' allocation. Legacy blocks often bypass modern RIR maintenance "
                "fees and possess unique historical transfer rights, making them the most sought-after assets for privacy-conscious buyers."
            )
        else:
            explanations.append(
                f"Heritage Analysis: Standard non-legacy {v_label} allocation. Subject to modern RIR membership terms and standard maintenance fee structures."
            )

        # Final normalization
        final_score = max(5.0, min(99.0, score))
        return round(final_score, 1), " ".join(explanations)
