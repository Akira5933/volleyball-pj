class Team {
    constructor(teamId, name, members = []) {
        this.teamId = teamId;
        this.name = name;
        this.members = members;

        this.point = 0;
        this.matchesPlayed = 0;
        this.wins = 0;
        this.losses = 0;

        this.setsWon = 0;
        this.setsLost = 0;

        this.scoredPoints = 0;
        this.concededPoints = 0;
    }

    recordResult(result) {
        this.matchesPlayed++;

        if (result.won) {
            this.wins++;
        } else {
            this.losses++;
        }

        this.point += result.leaguePoints;
        this.setsWon += result.setsWon;
        this.setsLost += result.setsLost;
        this.scoredPoints += result.scoredPoints;
        this.concededPoints += result.concededPoints;
    }

    get setDifference() {
        return this.setsWon - this.setsLost;
    }

    get pointDifference() {
        return this.scoredPoints - this.concededPoints;
    }
}

class Block {
    constructor(blockId, teams = [], calculateLeaguePoints) {
        this.blockId = blockId;
        this.teams = [];
        this.matches = [];

        if (typeof calculateLeaguePoints !== "function") {
            throw new Error("勝ち点計算ルールを指定してください");
        }

        this.calculateLeaguePoints = calculateLeaguePoints;

        teams.forEach(team => this.addTeam(team));
    }

    addTeam(team) {
        if (!(team instanceof Team)) {
            throw new Error("Teamクラスのインスタンスを指定してください");
        }

        if (this.getTeam(team.teamId)) {
            throw new Error(`Team ID ${team.teamId} は登録済みです`);
        }

        this.teams.push(team);
    }

    getTeam(teamId) {
        return this.teams.find(team => team.teamId === teamId);
    }

    recordMatch(teamAId, teamBId, setScores) {
        const teamA = this.getTeam(teamAId);
        const teamB = this.getTeam(teamBId);

        if (!teamA || !teamB || teamAId === teamBId) {
            throw new Error("対戦チームが正しくありません");
        }

        const alreadyPlayed = this.matches.some(match =>
            (match.teamAId === teamAId && match.teamBId === teamBId) ||
            (match.teamAId === teamBId && match.teamBId === teamAId)
        );

        if (alreadyPlayed) {
            throw new Error("この対戦カードは登録済みです");
        }

        if (!Array.isArray(setScores) ||
            ![2, 3].includes(setScores.length)) {
            throw new Error("セット数は2または3である必要があります");
        }

        let setsA = 0;
        let setsB = 0;
        let pointsA = 0;
        let pointsB = 0;

        setScores.forEach(([a, b]) => {
            const validScore =
                Number.isInteger(a) &&
                Number.isInteger(b) &&
                a >= 0 && b >= 0 &&
                (
                    (Math.max(a, b) === 15 && Math.abs(a - b) >= 2) ||
                    (Math.max(a, b) > 15 && Math.abs(a - b) === 2)
                );

            if (!validScore) {
                throw new Error("15点制・デュースありの得点として不正です");
            }

            if (a > b) {
                setsA++;
            } else {
                setsB++;
            }

            pointsA += a;
            pointsB += b;
        });

        if (
            Math.max(setsA, setsB) !== 2 ||
            (setScores.length === 3 &&
                setScores[0][0] > setScores[0][1] ===
                (setScores[1][0] > setScores[1][1]))
        ) {
            throw new Error("2セット先取の試合結果として不正です");
        }

        const teamAWon = setsA === 2;

        const leaguePointsA = this.calculateLeaguePoints({
            won: teamAWon,
            setsWon: setsA,
            setsLost: setsB
        });

        const leaguePointsB = this.calculateLeaguePoints({
            won: !teamAWon,
            setsWon: setsB,
            setsLost: setsA
        });

        if (![leaguePointsA, leaguePointsB].every(
            point => Number.isFinite(point) && point >= 0
        )) {
            throw new Error("勝ち点の計算結果が不正です");
        }

        teamA.recordResult({
            won: teamAWon,
            leaguePoints: leaguePointsA,
            setsWon: setsA,
            setsLost: setsB,
            scoredPoints: pointsA,
            concededPoints: pointsB
        });

        teamB.recordResult({
            won: !teamAWon,
            leaguePoints: leaguePointsB,
            setsWon: setsB,
            setsLost: setsA,
            scoredPoints: pointsB,
            concededPoints: pointsA
        });

        this.matches.push({
            teamAId,
            teamBId,
            setScores: setScores.map(scores => [...scores]),
            winnerId: teamAWon ? teamAId : teamBId
        });
    }

    getStandings() {
        return [...this.teams].sort((a, b) =>
            b.point - a.point ||
            b.wins - a.wins ||
            b.setDifference - a.setDifference ||
            b.pointDifference - a.pointDifference
        );
    }

    getQualifiers(count = 3) {
        return this.getStandings().slice(0, count);
    }
}

module.exports = {
    Block,
    Team
};