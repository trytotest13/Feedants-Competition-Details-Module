import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, EmptyState } from '../common/ui';
import { Avatar } from '../common/Avatar';
import { colors, fontFamily, fontSize, radius } from '../../theme/tokens';
import { useLocale } from '../../i18n/strings';
import { Testimonial } from '../../api/types';

/** "Hear From Our Users" — participant testimonials. */
export function TestimonialsCard({ testimonials }: { testimonials: Testimonial[] }) {
  const { t } = useLocale();

  return (
    <View>
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Card style={{ paddingVertical: 12 }}>
          <View style={styles.headerRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.navy} />
            <View style={styles.headerMeta}>
              <Text style={styles.title}>{t.hearFromUsers}</Text>
              <Text style={styles.subtitle}>{t.seeWhatParticipants}</Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {testimonials.length === 0 ? (
          <EmptyState message={t.noTestimonials} icon="chatbubbles-outline" />
        ) : (
          testimonials.map((item) => (
            <View key={item._id} style={styles.testimonial}>
              <Card style={{ padding: 14 }}>
                <View style={styles.quoteRow}>
                  <Avatar uri={item.avatarUrl} name={item.name} size={40} />
                  <View style={styles.quoteMeta}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.role}>{item.role}</Text>
                  </View>
                  <View style={styles.stars}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Ionicons
                        key={i}
                        name={i < item.rating ? 'star' : 'star-outline'}
                        size={12}
                        color={colors.amber}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.message}>“{item.message}”</Text>
              </Card>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerMeta: {
    flex: 1,
  },
  title: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
  },
  testimonial: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quoteMeta: {
    flex: 1,
  },
  name: {
    color: colors.navy,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
  },
  role: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 11,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  message: {
    marginTop: 10,
    color: colors.textBody,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
